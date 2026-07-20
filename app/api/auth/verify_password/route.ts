import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/telegram/auth-manager";

// POST /api/auth/verify_password  { password }
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }
  try {
    await verifyPassword(password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "That password didn't work." },
      { status: 200 }
    );
  }
}
