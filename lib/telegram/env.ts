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

// Vercel's deployment bundle (process.cwd()) is read-only at runtime — only
// /tmp is writable there, and /tmp is wiped between invocations and not
// shared across instances. On a normal persistent host (Railway/Render/Fly/
// a VPS) process.cwd() is writable and durable, so we only redirect to /tmp
// when we detect we're actually running on Vercel.
const onVercel = !!process.env.VERCEL;
if (onVercel && !process.env.DATA_DIR) {
  console.warn(
    "[telextract] Running on Vercel: falling back to /tmp for storage. " +
      "Sessions, history, and downloaded files will NOT persist between " +
      "requests or survive a cold start — see README.md for why this app " +
      "needs a persistent host (Railway/Render/Fly) instead."
  );
}

/** Where session/history/folders JSON files are persisted. Mount a real volume here in production. */
export const DATA_DIR = process.env.DATA_DIR || (onVercel ? "/tmp/telextract-data" : "./data");

/** Where downloaded video files land by default. */
export const DEFAULT_DOWNLOAD_ROOT =
  process.env.DOWNLOAD_ROOT || (onVercel ? "/tmp/telextract-downloads" : "./downloads");
