import { NextResponse } from "next/server";
import { cancelJob } from "@/lib/telegram/jobs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  cancelJob(jobId);
  return NextResponse.json({ ok: true });
}
