import { NextResponse } from "next/server";

// POST /api/pick-folder
// A native OS folder dialog can only ever work on a machine with a display —
// never on a cloud server. This mirrors the original app's Codespaces error path.
export async function POST() {
  return NextResponse.json(
    { error: "Native folder picker unavailable here" },
    { status: 200 }
  );
}
