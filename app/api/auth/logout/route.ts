import { NextResponse } from "next/server";
import { logout } from "@/lib/telegram/auth-manager";

// POST /api/auth/logout
export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
