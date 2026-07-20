import { NextResponse } from "next/server";
import { store, startSimulatedDownload } from "@/lib/mock-store";

// POST /api/jobs/:jobId/resume
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = store.jobs.get(jobId);
  if (job && job.status === "paused") {
    job.status = "downloading";
    startSimulatedDownload(job);
  }
  return NextResponse.json({ ok: true });
}
