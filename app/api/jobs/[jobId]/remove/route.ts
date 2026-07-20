import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/jobs/:jobId/remove
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = store.jobs.get(jobId);
  if (job?._timer) clearInterval(job._timer);
  store.jobs.delete(jobId);
  return NextResponse.json({ ok: true });
}
