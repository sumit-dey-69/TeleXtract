import { NextResponse } from "next/server";
import { logout } from "@/lib/telegram/auth-manager";
import { purgeAllDownloads } from "@/lib/telegram/jobs";

// POST /api/auth/logout
export async function POST() {
  await logout();
  purgeAllDownloads("logout");
  return NextResponse.json({ ok: true });
}
