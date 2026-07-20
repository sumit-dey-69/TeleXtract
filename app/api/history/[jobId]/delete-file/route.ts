import fs from "fs";
import { NextResponse } from "next/server";
import { getHistoryItem, markFileDeleted } from "@/lib/telegram/history-store";
import { resolveDestPath } from "@/lib/telegram/jobs";

// POST /api/history/:jobId/delete-file
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const item = getHistoryItem(jobId);
  if (!item) {
    return NextResponse.json({ error: "History entry not found." }, { status: 200 });
  }
  try {
    const filePath = resolveDestPath(item.dest_folder || "", item.filename || "");
    fs.rmSync(filePath, { force: true });
    markFileDeleted(jobId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete the file." },
      { status: 200 }
    );
  }
}
