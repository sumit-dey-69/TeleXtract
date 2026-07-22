import { NextResponse } from "next/server";
import { purgeAllDownloads } from "@/lib/telegram/jobs";

// POST /api/session/close — called via navigator.sendBeacon when the page
// unloads (tab close, navigation away, or a refresh — browsers don't
// distinguish these). Deletes downloaded files only; the Telegram login
// session itself is left intact so the user isn't logged out just from
// closing a tab.
export async function POST() {
  purgeAllDownloads("tab-close");
  return NextResponse.json({ ok: true });
}
