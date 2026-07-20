export type JobStatus =
  | "queued"
  | "resolving"
  | "downloading"
  | "paused"
  | "done"
  | "error"
  | "cancelled"
  | "deleted";

export interface Job {
  job_id: string;
  link: string;
  dest_folder: string;
  filename?: string;
  status: JobStatus;
  pct?: number;
  current?: number;
  total?: number;
  error?: string;
}

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

export interface AuthStatus {
  authorized: boolean;
  name?: string;
}

export interface SavedFolder {
  id: string;
  path: string;
}

export interface ResolveResponse {
  filename: string;
  conflict: boolean;
  error?: string;
}
