import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// DELETE /api/history/:jobId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  store.history = store.history.filter((h) => h.job_id !== jobId);
  return NextResponse.json({ ok: true });
}
