import { NextResponse } from "next/server";

// GET /api/history/:jobId/file
// TODO(backend): stream the real file from wherever completed downloads are stored.
export async function GET() {
  return NextResponse.json(
    { error: "File streaming isn't wired up to a real backend yet." },
    { status: 501 }
  );
}
