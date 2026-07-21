"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobMeter } from "@/components/job-meter";
import { fmtBytes, cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

const STATUS_VARIANT: Record<Job["status"], "default" | "muted" | "accent" | "warn" | "err"> = {
  queued: "warn",
  resolving: "warn",
  downloading: "accent",
  paused: "warn",
  done: "accent",
  error: "err",
  cancelled: "muted",
  deleted: "muted",
};

export function JobCard({
  job: initialJob,
  onRemoved,
}: {
  job: Job;
  onRemoved: (jobId: string) => void;
}) {
  const [job, setJob] = useState(initialJob);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (["done", "error", "cancelled", "deleted"].includes(initialJob.status)) return;

    const source = new EventSource(`/api/progress/${initialJob.job_id}`);
    source.onmessage = (ev) => {
      const state: Job = JSON.parse(ev.data);
      setJob(state);
      if (["done", "error", "cancelled", "deleted"].includes(state.status)) {
        source.close();
      }
    };
    source.onerror = () => source.close();
    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJob.job_id]);

  async function act(action: string) {
    setBusy(true);
    try {
      await fetch(`/api/jobs/${job.job_id}/${action}`, { method: "POST" });
    } finally {
      setBusy(false);
    }
  }

  async function deleteFile() {
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.job_id}/delete-file`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        alert(data.error || "Could not delete the file.");
        return;
      }
      onRemoved(job.job_id);
    } catch (err) {
      alert("Could not reach the server: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await fetch(`/api/jobs/${job.job_id}/remove`, { method: "POST" });
    onRemoved(job.job_id);
  }

  const inProgress = ["queued", "resolving", "downloading"].includes(job.status);

  return (
    <Card className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="truncate font-mono text-xs text-muted">{job.link}</div>
        <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
      </div>
      <div className="mb-2.5 truncate font-display text-sm font-semibold">
        {job.filename || "resolving filename…"}
      </div>
      <JobMeter pct={job.pct ?? 0} paused={job.status === "paused"} />
      <div className="mt-2 flex justify-between font-mono text-[11.5px] text-muted">
        <span>{job.pct ?? 0}%</span>
        <span>
          {fmtBytes(job.current)} / {fmtBytes(job.total)}
        </span>
      </div>
      {job.dest_folder && (
        <div
          className="mt-1.5 truncate font-mono text-[11px] text-muted"
          title={job.dest_folder}
        >
          {job.dest_folder}
        </div>
      )}
      {job.status === "error" && job.error && (
        <div className="mt-2 font-mono text-xs text-err">{job.error}</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {inProgress && (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("pause")}>
              Pause
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => act("cancel")}>
              Cancel
            </Button>
          </>
        )}
        {job.status === "paused" && (
          <>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => act("resume")}>
              Resume
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => act("cancel")}>
              Cancel
            </Button>
          </>
        )}
        {job.status === "done" && (
          <>
            <a
              href={`/api/jobs/${job.job_id}/file`}
              download
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-accent-dim px-3.5 py-1.5",
                "font-display text-[13px] font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
              )}
            >
              ↓ Download to my computer
            </a>
            <Button size="sm" variant="destructive" disabled={busy} onClick={deleteFile}>
              Delete file
            </Button>
          </>
        )}
        {["cancelled", "error", "deleted"].includes(job.status) && (
          <Button size="sm" variant="secondary" onClick={remove}>
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}
