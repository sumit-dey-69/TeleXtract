import { NextResponse } from "next/server";
import { listHistory } from "@/lib/telegram/history-store";

// GET /api/history
export async function GET() {
  return NextResponse.json(listHistory());
}
