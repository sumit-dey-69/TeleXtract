import { NextResponse } from "next/server";
import type { ResolveResponse } from "@/lib/types";

// POST /api/resolve  { link, dest_folder, filename }
// TODO(backend): ask Telethon for the message's real filename and check the
// destination folder on disk for a name collision, exactly like the original
// resolve_link() view did.
export async function POST(req: Request) {
  const { link, filename } = await req.json();
  if (!link || typeof link !== "string" || !link.includes("t.me/")) {
    return NextResponse.json(
      { error: "That doesn't look like a Telegram message link." },
      { status: 200 }
    );
  }

  const idPart = link.split("/").filter(Boolean).pop() || "video";
  const resolvedName = filename?.trim() ? filename.trim() : `telegram_${idPart}.mp4`;

  const body: ResolveResponse = { filename: resolvedName, conflict: false };
  return NextResponse.json(body);
}
