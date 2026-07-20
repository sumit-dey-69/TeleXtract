import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/jobs/:jobId/cancel
// TODO(backend): stop the Telethon download coroutine and delete the partial file.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = store.jobs.get(jobId);
  if (job) {
    if (job._timer) clearInterval(job._timer);
    job.status = "cancelled";
  }
  return NextResponse.json({ ok: true });
}
