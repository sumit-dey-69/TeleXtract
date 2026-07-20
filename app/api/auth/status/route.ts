import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";
import type { AuthStatus } from "@/lib/types";

// GET /api/auth/status — mirrors the original Flask route of the same name.
// TODO(backend): replace with a call to your Telethon/gramjs auth service.
export async function GET() {
  const body: AuthStatus = {
    authorized: store.authorized,
    name: store.name ?? undefined,
  };
  return NextResponse.json(body);
}
