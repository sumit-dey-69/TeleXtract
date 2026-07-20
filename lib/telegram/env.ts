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

/** Where session/history/folders JSON files are persisted. Mount a real volume here in production. */
export const DATA_DIR = process.env.DATA_DIR || "./data";

/** Where downloaded video files land by default. */
export const DEFAULT_DOWNLOAD_ROOT = process.env.DOWNLOAD_ROOT || "./downloads";
