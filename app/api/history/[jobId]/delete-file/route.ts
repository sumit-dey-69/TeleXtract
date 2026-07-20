import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/history/:jobId/delete-file
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const item = store.history.find((h) => h.job_id === jobId);
  if (item) item.file_exists = false;
  return NextResponse.json({ ok: true });
}
