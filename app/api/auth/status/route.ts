import { NextResponse } from "next/server";
import { getStatus } from "@/lib/telegram/auth-manager";

// GET /api/auth/status
export async function GET() {
  const status = await getStatus();
  return NextResponse.json(status);
}
