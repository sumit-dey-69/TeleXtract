import { NextResponse } from "next/server";
import { pauseJob } from "@/lib/telegram/jobs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  pauseJob(jobId);
  return NextResponse.json({ ok: true });
}
