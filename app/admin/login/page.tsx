"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LantanaMark } from "@/components/brand/LantanaMark";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError("Invalid email or password."); setBusy(false); return; }
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <LantanaMark className="mx-auto h-10 w-10 text-olive" />
          <h1 className="mt-4 font-display text-3xl font-light tracking-wide2">LANTANA</h1>
          <p className="mt-1 font-body text-[11px] uppercase tracking-luxe text-ink/50">Maison Administration</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          {error && <p className="font-body text-xs text-red-800" role="alert">{error}</p>}
          <Button className="w-full" onClick={submit} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </div>
      </div>
    </main>
  );
}
