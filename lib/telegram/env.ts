import fs from "fs";
import os from "os";
import path from "path";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Get an API ID/hash from https://my.telegram.org/apps and set ${name} in your host's environment variables.`
    );
  }
  return value;
}

export function getApiId(): number {
  return Number(required("TELEGRAM_API_ID"));
}

export function getApiHash(): string {
  return required("TELEGRAM_API_HASH");
}

/**
 * Some hosts (Vercel, and serverless platforms generally) ship the app as a
 * read-only bundle — only a temp directory is writable there, and it's wiped
 * between invocations. Hosts with a persistent process (Railway, Render,
 * Fly.io, a VPS, Docker) have a normal writable, durable filesystem.
 *
 * Rather than hardcoding checks for specific platforms, we test-write into
 * the working directory once at startup and fall back to the OS temp
 * directory if that fails. This is correct on Vercel and on any other
 * read-only-bundle host, without hardcoding any platform-specific paths.
 */
function isWorkingDirWritable(): boolean {
  try {
    const probe = path.join(process.cwd(), `.write-test-${process.pid}`);
    fs.writeFileSync(probe, "");
    fs.rmSync(probe, { force: true });
    return true;
  } catch {
    return false;
  }
}

// process.env.VERCEL is a fast, reliable signal when present; the disk probe
// is the generic fallback for every other read-only-bundle host.
const needsTmpFallback = !!process.env.VERCEL || !isWorkingDirWritable();

if (needsTmpFallback && (!process.env.DATA_DIR || !process.env.DOWNLOAD_ROOT)) {
  console.warn(
    "[telextract] The application directory isn't writable (typical of Vercel and " +
      "other serverless hosts). Falling back to the OS temp directory for any of " +
      "DATA_DIR / DOWNLOAD_ROOT that weren't explicitly set. This unblocks startup, " +
      "but storage there is ephemeral — sessions, history, and downloaded files won't " +
      "reliably persist between requests or cold starts. For this app to work as " +
      "intended, deploy to a host with a persistent disk (Railway, Render, Fly.io, a " +
      "VPS, Docker) and point DATA_DIR / DOWNLOAD_ROOT at a mounted volume."
  );
}

const tmpBase = path.join(os.tmpdir(), "telextract");

/** Where session/history/folders JSON files are persisted. Point this at a mounted volume in production. */
export const DATA_DIR =
  process.env.DATA_DIR || (needsTmpFallback ? path.join(tmpBase, "data") : "./data");

/** Where downloaded video files land by default, and the base that any
 * relative per-download folder (typed into the UI) resolves against — so
 * user-entered relative paths can never land under a read-only app bundle.
 */
export const DEFAULT_DOWNLOAD_ROOT =
  process.env.DOWNLOAD_ROOT || (needsTmpFallback ? path.join(tmpBase, "downloads") : "./downloads");

/**
 * How long a completed download is kept before it's auto-deleted, in
 * minutes. Set FILE_RETENTION_MINUTES=0 to disable time-based cleanup
 * entirely (logout/tab-close cleanup, if enabled, still applies).
 */
export const FILE_RETENTION_MINUTES = Number(process.env.FILE_RETENTION_MINUTES ?? 60);
