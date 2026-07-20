import { NextResponse } from "next/server";
import { removeFolder } from "@/lib/telegram/folders-store";

// DELETE /api/folders/:folderId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  removeFolder(folderId);
  return NextResponse.json({ ok: true });
}
