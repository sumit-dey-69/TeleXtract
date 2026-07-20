import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/auth/send_code  { phone }
// TODO(backend): call client.send_code_request(phone) on your Telegram service.
export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }
  store.pendingPhone = phone;
  return NextResponse.json({ ok: true });
}
