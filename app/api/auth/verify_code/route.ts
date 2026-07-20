import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/telegram/auth-manager";

// POST /api/auth/verify_code  { code }
export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Login code is required." }, { status: 400 });
  }
  try {
    const result = await verifyCode(code);
    if (result.status === "awaiting_password") {
      return NextResponse.json({ needs_password: true });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "That code didn't work." },
      { status: 200 }
    );
  }
}
