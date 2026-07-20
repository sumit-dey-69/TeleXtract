import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// GET /api/folders
export async function GET() {
  return NextResponse.json(store.folders);
}

// POST /api/folders  { path }
export async function POST(req: Request) {
  const { path } = await req.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "A folder path is required." }, { status: 400 });
  }
  const folder = { id: Math.random().toString(36).slice(2, 9), path };
  store.folders.push(folder);
  return NextResponse.json(folder);
}
