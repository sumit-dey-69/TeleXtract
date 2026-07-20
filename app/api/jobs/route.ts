import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// GET /api/jobs
export async function GET() {
  return NextResponse.json(Array.from(store.jobs.values()));
}
