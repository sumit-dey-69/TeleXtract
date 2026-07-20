import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/auth/logout
// TODO(backend): revoke the Telegram session and delete the .session file server-side.
export async function POST() {
  store.authorized = false;
  store.name = null;
  store.pendingPhone = null;
  store.needsPassword = false;
  return NextResponse.json({ ok: true });
}
