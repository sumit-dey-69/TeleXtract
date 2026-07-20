import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { requireClient } from "./auth-manager";
import { DEFAULT_DOWNLOAD_ROOT } from "./env";
import { appendHistory } from "./history-store";
import { extractFileInfo, fetchMessage } from "./link-resolver";

export type JobStatus =
  | "queued"
  | "resolving"
  | "downloading"
  | "paused"
  | "done"
  | "error"
  | "cancelled"
  | "deleted";

export interface JobRecord {
  job_id: string;
  link: string;
  dest_folder: string;
  filename: string;
  status: JobStatus;
  current: number;
  total: number;
  pct: number;
  error?: string;
}

interface InternalJob extends JobRecord {
  _controller?: AbortController;
  _generation: number; // bumped on every (re)start so stale abort/finish callbacks are ignored
}

const g = globalThis as unknown as {
  __telextractJobs?: Map<string, InternalJob>;
  __telextractJobsEmitter?: EventEmitter;
};
const jobs = g.__telextractJobs ?? (g.__telextractJobs = new Map());
const emitter = g.__telextractJobsEmitter ?? (g.__telextractJobsEmitter = new EventEmitter());
emitter.setMaxListeners(0);

function toPublic(job: InternalJob): JobRecord {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _controller, _generation, ...rest } = job;
  return rest;
}

function emitUpdate(jobId: string) {
  const job = jobs.get(jobId);
  if (job) emitter.emit("update", jobId, toPublic(job));
}

export function onJobUpdate(jobId: string, cb: (job: JobRecord) => void): () => void {
  const handler = (id: string, job: JobRecord) => {
    if (id === jobId) cb(job);
  };
  emitter.on("update", handler);
  return () => emitter.off("update", handler);
}

export function listJobs(): JobRecord[] {
  return Array.from(jobs.values()).map(toPublic);
}

export function getJob(jobId: string): JobRecord | undefined {
  const job = jobs.get(jobId);
  return job ? toPublic(job) : undefined;
}

export function resolveDestPath(destFolder: string, filename: string): string {
  const folder = destFolder?.trim() ? destFolder.trim() : DEFAULT_DOWNLOAD_ROOT;
  const abs = path.isAbsolute(folder)
    ? folder
    : path.join(/* turbopackIgnore: true */ process.cwd(), folder);
  fs.mkdirSync(abs, { recursive: true });
  return path.join(abs, filename);
}

export async function resolveLink(
  link: string,
  filename: string | undefined,
  destFolder: string
): Promise<{ filename: string; conflict: boolean }> {
  const message = await fetchMessage(link);
  const info = extractFileInfo(message);
  const finalName = filename?.trim() || info.filename;
  const destPath = resolveDestPath(destFolder, finalName);
  return { filename: finalName, conflict: fs.existsSync(destPath) };
}

export function startDownload(link: string, destFolder: string, filename: string): string {
  const job_id = Math.random().toString(36).slice(2, 10);
  const job: InternalJob = {
    job_id,
    link,
    dest_folder: destFolder || DEFAULT_DOWNLOAD_ROOT,
    filename: filename || "",
    status: "resolving",
    current: 0,
    total: 0,
    pct: 0,
    _generation: 0,
  };
  jobs.set(job_id, job);
  runDownload(job);
  return job_id;
}

function runDownload(job: InternalJob) {
  const generation = ++job._generation;
  const controller = new AbortController();
  job._controller = controller;

  (async () => {
    const client = await requireClient();
    const message = await fetchMessage(job.link);
    const info = extractFileInfo(message);
    if (!job.filename) job.filename = info.filename;
    job.total = info.size;
    job.status = "downloading";
    emitUpdate(job.job_id);

    const destPath = resolveDestPath(job.dest_folder, job.filename);

    await client.downloadMedia(message, {
      outputFile: destPath,
      signal: controller.signal,
      progressCallback: (downloaded, total) => {
        if (job._generation !== generation) return; // a newer attempt superseded this one
        job.current = Number(downloaded);
        job.total = Number(total);
        job.pct = job.total ? Math.round((job.current / job.total) * 100) : 0;
        emitUpdate(job.job_id);
      },
    });

    if (job._generation !== generation) return;
    job.status = "done";
    job.pct = 100;
    emitUpdate(job.job_id);
    appendHistory({
      job_id: job.job_id,
      link: job.link,
      filename: job.filename,
      dest_folder: job.dest_folder,
      status: "done",
      timestamp: Math.floor(Date.now() / 1000),
      total: job.total,
      file_exists: true,
    });
  })().catch((err) => {
    if (job._generation !== generation) return; // superseded by pause/resume/cancel — ignore
    const aborted = err?.name === "AbortError" || controller.signal.aborted;
    if (aborted) {
      // Whoever aborted us (pause/cancel) already set the right status.
      return;
    }
    job.status = "error";
    job.error = err instanceof Error ? err.message : String(err);
    emitUpdate(job.job_id);
    appendHistory({
      job_id: job.job_id,
      link: job.link,
      filename: job.filename,
      dest_folder: job.dest_folder,
      status: "error",
      timestamp: Math.floor(Date.now() / 1000),
      error: job.error,
    });
  });
}

export function pauseJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job || job.status !== "downloading") return;
  job.status = "paused";
  job._generation++; // invalidate the in-flight attempt's callbacks
  job._controller?.abort();
  emitUpdate(jobId);
}

export function resumeJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job || job.status !== "paused") return;
  // Note: the underlying library doesn't expose a byte-offset resume, so this
  // restarts the download from the beginning rather than continuing from
  // where it left off.
  job.current = 0;
  job.pct = 0;
  job.status = "downloading";
  emitUpdate(jobId);
  runDownload(job);
}

export function cancelJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;
  job._generation++;
  job._controller?.abort();
  job.status = "cancelled";
  try {
    const destPath = resolveDestPath(job.dest_folder, job.filename);
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
  } catch {
    // best effort cleanup
  }
  emitUpdate(jobId);
}

export function deleteJobFile(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) throw new Error("Job not found.");
  const destPath = resolveDestPath(job.dest_folder, job.filename);
  fs.rmSync(destPath, { force: true });
  job.status = "deleted";
  emitUpdate(jobId);
}

export function removeJob(jobId: string) {
  const job = jobs.get(jobId);
  job?._controller?.abort();
  jobs.delete(jobId);
}

export function getJobFilePath(jobId: string): string {
  const job = jobs.get(jobId);
  if (!job) throw new Error("Job not found.");
  return resolveDestPath(job.dest_folder, job.filename);
}
