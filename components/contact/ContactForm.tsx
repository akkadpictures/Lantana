"use client";

import { useState } from "react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function submit() {
    if (!form.name || !form.email || !form.message || state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setState(res.ok ? "done" : "idle");
    } catch {
      setState("idle");
    }
  }

  if (state === "done") return <p className="font-body text-sm text-olive-deep">{dict.contactPage.sent}</p>;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="c-name">{dict.checkout.name}</Label>
        <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="c-email">{dict.checkout.email}</Label>
        <Input id="c-email" type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="c-msg">{dict.contactPage.message}</Label>
        <Textarea id="c-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      <Button variant="olive" onClick={submit} disabled={state === "busy"}>{dict.contactPage.send}</Button>
    </div>
  );
}
