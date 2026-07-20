import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/jobs/:jobId/pause
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = store.jobs.get(jobId);
  if (job && ["queued", "resolving", "downloading"].includes(job.status)) {
    job.status = "paused";
  }
  return NextResponse.json({ ok: true });
}
