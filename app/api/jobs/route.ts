import { NextResponse } from "next/server";
import { listJobs } from "@/lib/telegram/jobs";

// GET /api/jobs
export async function GET() {
  return NextResponse.json(listJobs());
}
