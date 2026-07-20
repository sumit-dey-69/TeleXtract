import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a byte count as a human-readable MB string, matching the original app's display. */
export function fmtBytes(n: number | undefined | null): string {
  if (!n) return "0 MB";
  return (n / 1024 / 1024).toFixed(1) + " MB";
}

/** Formats a unix timestamp (seconds) as a locale date/time string. */
export function fmtWhen(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Suggests an alternative filename when a conflict is detected, e.g. "clip.mp4" -> "clip_1.mp4". */
export function suggestAlternative(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return filename + "_1";
  return filename.slice(0, dot) + "_1" + filename.slice(dot);
}
