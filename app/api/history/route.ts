import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// GET /api/history
export async function GET() {
  return NextResponse.json(store.history);
}
