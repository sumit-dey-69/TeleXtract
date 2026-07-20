import { NextResponse } from "next/server";
import { resolveLink } from "@/lib/telegram/jobs";

// POST /api/resolve  { link, dest_folder, filename }
export async function POST(req: Request) {
  const { link, dest_folder, filename } = await req.json();
  if (!link || typeof link !== "string") {
    return NextResponse.json({ error: "A message link is required." }, { status: 200 });
  }
  try {
    const result = await resolveLink(link, filename, dest_folder);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not resolve that link." },
      { status: 200 }
    );
  }
}
