import { NextResponse } from "next/server";
import { newJob } from "@/lib/mock-store";

// POST /api/download  { link, dest_folder, filename }
// TODO(backend): queue a real Telethon download job and return its job_id.
export async function POST(req: Request) {
  const { link, dest_folder, filename } = await req.json();
  if (!link) {
    return NextResponse.json({ error: "A message link is required." }, { status: 400 });
  }
  const job = newJob(link, dest_folder, filename);
  return NextResponse.json({ job_id: job.job_id });
}
