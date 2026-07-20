import { NextResponse } from "next/server";

// GET /api/jobs/:jobId/file
// TODO(backend): stream the real file (from disk or object storage) with
// Content-Disposition: attachment, like the original send_file() route did.
export async function GET() {
  return NextResponse.json(
    { error: "File streaming isn't wired up to a real backend yet." },
    { status: 501 }
  );
}
