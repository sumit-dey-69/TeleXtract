import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// DELETE /api/folders/:folderId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  store.folders = store.folders.filter((f) => f.id !== folderId);
  return NextResponse.json({ ok: true });
}
