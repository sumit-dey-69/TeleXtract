import { NextResponse } from "next/server";
import { sendCode } from "@/lib/telegram/auth-manager";

// POST /api/auth/send_code  { phone }
export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }
  try {
    await sendCode(phone);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send the login code." },
      { status: 200 }
    );
  }
}
