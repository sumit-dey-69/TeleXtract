import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/auth/verify_code  { phone, code }
// TODO(backend): call client.sign_in(phone, code); catch SessionPasswordNeededError
// and return { needs_password: true } exactly like the original app did.
export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Login code is required." }, { status: 400 });
  }

  // Demo behaviour: code "2222" simulates an account with 2FA enabled.
  if (code === "2222") {
    store.needsPassword = true;
    return NextResponse.json({ needs_password: true });
  }

  store.authorized = true;
  store.name = "Demo Account";
  return NextResponse.json({ ok: true });
}
