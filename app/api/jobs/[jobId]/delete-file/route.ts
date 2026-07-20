import { NextResponse } from "next/server";
import { deleteJobFile } from "@/lib/telegram/jobs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    deleteJobFile(jobId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete the file." },
      { status: 200 }
    );
  }
}
