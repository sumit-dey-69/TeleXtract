import fs from "fs";
import path from "path";
import { DATA_DIR } from "./env";

const SESSION_FILE = path.join(DATA_DIR, "session.txt");

/**
 * Session resolution order:
 * 1. TELEGRAM_SESSION env var — set this on your host after your first login
 *    (copy the string this app prints/writes to data/session.txt) so the
 *    session survives even if the host's disk is ephemeral (e.g. some free
 *    tiers on Render redeploy with a clean filesystem).
 * 2. data/session.txt on disk — works as-is on hosts with a persistent
 *    volume (a small VPS, a Fly.io volume, a Railway volume).
 */
export function loadSession(): string {
  if (process.env.TELEGRAM_SESSION) return process.env.TELEGRAM_SESSION;
  try {
    return fs.readFileSync(SESSION_FILE, "utf-8").trim();
  } catch {
    return "";
  }
}

export function saveSession(session: string) {
  // If TELEGRAM_SESSION is set, we treat it as the source of truth and don't
  // try to overwrite it (there's nowhere safe to write an env var to).
  if (process.env.TELEGRAM_SESSION) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SESSION_FILE, session, "utf-8");
  } catch (err) {
    console.error("Could not persist Telegram session to disk:", err);
  }
}

export function clearSession() {
  if (process.env.TELEGRAM_SESSION) return;
  try {
    fs.rmSync(SESSION_FILE, { force: true });
  } catch {
    // ignore
  }
}
