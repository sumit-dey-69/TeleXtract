import { NextResponse } from "next/server";
import { removeJob } from "@/lib/telegram/jobs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  removeJob(jobId);
  return NextResponse.json({ ok: true });
}
