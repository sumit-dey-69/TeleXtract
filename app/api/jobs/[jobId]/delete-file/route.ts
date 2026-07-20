import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/jobs/:jobId/delete-file
// TODO(backend): delete the file from disk/object storage.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = store.jobs.get(jobId);
  if (job) job.status = "deleted";
  return NextResponse.json({ ok: true });
}
