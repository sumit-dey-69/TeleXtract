import { NextResponse } from "next/server";
import { resumeJob } from "@/lib/telegram/jobs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  resumeJob(jobId);
  return NextResponse.json({ ok: true });
}
