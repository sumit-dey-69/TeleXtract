import type { HistoryItem, Job, SavedFolder } from "./types";

/**
 * MOCK BACKEND
 * ------------
 * Everything in this file simulates what the Python/Telethon service used to do
 * (auth, folders, resolve, download progress, history). It exists purely so the
 * UI is clickable end-to-end today.
 *
 * It is NOT a real download engine and it is NOT persistent across serverless
 * invocations on Vercel (each request may hit a cold instance with fresh
 * in-memory state). When you wire up the real backend, replace the functions
 * below with calls to your actual service — the route handlers in app/api/**
 * already match the original app's request/response shapes, so most of the
 * wiring is just swapping the function bodies here.
 */

type Store = {
  authorized: boolean;
  name: string | null;
  pendingPhone: string | null;
  needsPassword: boolean;
  folders: SavedFolder[];
  jobs: Map<string, Job & { _timer?: ReturnType<typeof setInterval> }>;
  history: HistoryItem[];
};

const globalForStore = globalThis as unknown as { __telextractStore?: Store };

export const store: Store =
  globalForStore.__telextractStore ??
  (globalForStore.__telextractStore = {
    authorized: false,
    name: null,
    pendingPhone: null,
    needsPassword: false,
    folders: [{ id: "default", path: "downloads" }],
    jobs: new Map(),
    history: [],
  });

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function filenameFromLink(link: string) {
  const idPart = link.split("/").filter(Boolean).pop() || "video";
  return `telegram_${idPart}.mp4`;
}

export function startSimulatedDownload(job: Job) {
  const record = store.jobs.get(job.job_id);
  if (!record) return;

  record._timer = setInterval(() => {
    const current = store.jobs.get(job.job_id);
    if (!current || current.status !== "downloading") return;

    const total = current.total ?? 42_000_000;
    const next = Math.min(total, (current.current ?? 0) + total * 0.08);
    current.current = next;
    current.pct = Math.round((next / total) * 100);

    if (next >= total) {
      current.status = "done";
      current.pct = 100;
      clearInterval(current._timer);
      store.history.unshift({
        job_id: current.job_id,
        link: current.link,
        filename: current.filename,
        dest_folder: current.dest_folder,
        status: "done",
        timestamp: Math.floor(Date.now() / 1000),
        total: current.total,
        file_exists: true,
      });
    }
    store.jobs.set(job.job_id, current);
  }, 700);

  store.jobs.set(job.job_id, record);
}

export function newJob(link: string, destFolder: string, filename: string): Job {
  const job_id = randomId();
  const job: Job = {
    job_id,
    link,
    dest_folder: destFolder || "downloads",
    filename: filename || filenameFromLink(link),
    status: "downloading",
    pct: 0,
    current: 0,
    total: 42_000_000,
  };
  store.jobs.set(job_id, job);
  startSimulatedDownload(job);
  return job;
}
