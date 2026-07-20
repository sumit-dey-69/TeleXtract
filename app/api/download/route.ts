import { NextResponse } from "next/server";
import { startDownload } from "@/lib/telegram/jobs";

// POST /api/download  { link, dest_folder, filename }
export async function POST(req: Request) {
  const { link, dest_folder, filename } = await req.json();
  if (!link) {
    return NextResponse.json({ error: "A message link is required." }, { status: 400 });
  }
  try {
    const job_id = startDownload(link, dest_folder, filename);
    return NextResponse.json({ job_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start the download." },
      { status: 200 }
    );
  }
}
