import { NextResponse } from "next/server";
import { removeHistoryItem } from "@/lib/telegram/history-store";

// DELETE /api/history/:jobId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  removeHistoryItem(jobId);
  return NextResponse.json({ ok: true });
}
