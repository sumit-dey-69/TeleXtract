"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtBytes, fmtWhen, cn } from "@/lib/utils";
import type { HistoryItem } from "@/lib/types";

const STATUS_VARIANT: Record<HistoryItem["status"], "default" | "muted" | "accent" | "warn" | "err"> = {
  queued: "warn",
  resolving: "warn",
  downloading: "accent",
  paused: "warn",
  done: "accent",
  error: "err",
  cancelled: "muted",
  deleted: "muted",
};

export function HistoryCard({
  item,
  onChanged,
}: {
  item: HistoryItem;
  onChanged: () => void;
}) {
  async function deleteFile() {
    await fetch(`/api/history/${item.job_id}/delete-file`, { method: "POST" });
    onChanged();
  }

  async function remove() {
    await fetch(`/api/history/${item.job_id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <Card className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="truncate font-mono text-xs text-muted">{item.link}</div>
        <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
      </div>
      <div className="mb-2.5 truncate font-display text-sm font-semibold">
        {item.filename || "(filename unknown)"}
      </div>
      <div className="truncate font-mono text-[11px] text-muted">{item.dest_folder || ""}</div>
      <div className="mt-2 flex justify-between font-mono text-[11.5px] text-muted">
        <span>Downloaded: {fmtWhen(item.timestamp)}</span>
        <span>{fmtBytes(item.total)}</span>
      </div>
      {item.status === "error" && item.error && (
        <div className="mt-2 font-mono text-xs text-err">{item.error}</div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.status === "done" && item.file_exists && (
          <>
            <a
              href={`/api/history/${item.job_id}/file`}
              download
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-accent-dim px-3.5 py-1.5",
                "font-display text-[13px] font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
              )}
            >
              ↓ Download to my computer
            </a>
            <Button size="sm" variant="destructive" onClick={deleteFile}>
              Delete file
            </Button>
          </>
        )}
        <Button size="sm" variant="secondary" onClick={remove}>
          Remove from history
        </Button>
      </div>
    </Card>
  );
}
