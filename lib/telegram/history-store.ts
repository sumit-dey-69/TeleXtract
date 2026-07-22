import fs from "fs";
import path from "path";
import { DATA_DIR } from "./env";
import type { JobStatus } from "./jobs";

const HISTORY_FILE = path.join(DATA_DIR, "history.json");

export interface HistoryItem {
  job_id: string;
  link: string;
  filename?: string;
  dest_folder?: string;
  status: JobStatus;
  timestamp: number;
  total?: number;
  error?: string;
  file_exists?: boolean;
}

function readAll(): HistoryItem[] {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(items: HistoryItem[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function listHistory(): HistoryItem[] {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function appendHistory(item: HistoryItem) {
  const items = readAll();
  items.unshift(item);
  writeAll(items);
}

export function markFileDeleted(jobId: string) {
  const items = readAll();
  const item = items.find((i) => i.job_id === jobId);
  if (item) item.file_exists = false;
  writeAll(items);
}

/** Marks every history item as no-longer-on-disk. Used when all downloads are purged at once (logout / tab close). */
export function markAllFilesDeleted() {
  const items = readAll();
  for (const item of items) item.file_exists = false;
  writeAll(items);
}

/** History items whose file is still marked as present but is older than `cutoffMs` (epoch ms). */
export function listExpiredHistory(cutoffMs: number): HistoryItem[] {
  return readAll().filter(
    (i) => i.status === "done" && i.file_exists !== false && i.timestamp * 1000 < cutoffMs
  );
}

export function removeHistoryItem(jobId: string) {
  writeAll(readAll().filter((i) => i.job_id !== jobId));
}

export function getHistoryItem(jobId: string): HistoryItem | undefined {
  return readAll().find((i) => i.job_id === jobId);
}
