"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Step = "phone" | "code" | "password";

export function LoginCard({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!phone.trim()) return;
    setBusy(true);
    const res = await fetch("/api/auth/send_code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.error) return setError(data.error);
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;
    setBusy(true);
    const res = await fetch("/api/auth/verify_code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.error) return setError(data.error);
    if (data.needs_password) return setStep("password");
    onLoggedIn();
  }

  async function verifyPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return;
    setBusy(true);
    const res = await fetch("/api/auth/verify_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.error) return setError(data.error);
    onLoggedIn();
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        {step === "phone" && (
          <div>
            <Label htmlFor="phone" className="mb-2 block">
              Phone number
            </Label>
            <form onSubmit={sendCode} className="flex gap-2.5">
              <Input
                id="phone"
                placeholder="+91xxxxxxxxxx"
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Send code
              </Button>
            </form>
            <p className="mt-2.5 font-mono text-[11.5px] text-muted">
              Include your country code. Telegram will send a login code to your app.
            </p>
          </div>
        )}

        {step === "code" && (
          <div>
            <Label htmlFor="code" className="mb-2 block">
              Login code
            </Label>
            <form onSubmit={verifyCode} className="flex gap-2.5">
              <Input
                id="code"
                placeholder="12345"
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Verify
              </Button>
            </form>
            <button
              type="button"
              className="mt-3 font-mono text-[11.5px] text-muted underline"
              onClick={() => {
                setError("");
                setStep("phone");
              }}
            >
              ‹ use a different number
            </button>
          </div>
        )}

        {step === "password" && (
          <div>
            <Label htmlFor="password" className="mb-2 block">
              Two-step password
            </Label>
            <form onSubmit={verifyPassword} className="flex gap-2.5">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" disabled={busy}>
                Unlock
              </Button>
            </form>
            <p className="mt-2.5 font-mono text-[11.5px] text-muted">
              Your account has 2FA enabled — enter your cloud password.
            </p>
          </div>
        )}

        {error && <div className="mt-2.5 font-mono text-xs text-err">{error}</div>}
      </CardContent>
    </Card>
  );
}
