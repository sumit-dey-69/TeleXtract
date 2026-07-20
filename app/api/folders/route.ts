import { NextResponse } from "next/server";
import { listFolders, addFolder } from "@/lib/telegram/folders-store";

// GET /api/folders
export async function GET() {
  return NextResponse.json(listFolders());
}

// POST /api/folders  { path }
export async function POST(req: Request) {
  const { path } = await req.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "A folder path is required." }, { status: 400 });
  }
  return NextResponse.json(addFolder(path));
}
