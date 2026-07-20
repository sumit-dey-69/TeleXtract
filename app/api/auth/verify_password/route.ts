import { NextResponse } from "next/server";
import { store } from "@/lib/mock-store";

// POST /api/auth/verify_password  { password }
// TODO(backend): call client.sign_in(password=password).
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }
  store.authorized = true;
  store.needsPassword = false;
  store.name = "Demo Account";
  return NextResponse.json({ ok: true });
}
