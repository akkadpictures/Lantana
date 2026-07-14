"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n";

export function NewsletterForm({ dict }: { dict: Dictionary }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function submit() {
    if (!email || state === "busy") return;
    setState("busy");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => null);
    } finally {
      setState("done");
    }
  }

  if (state === "done") return <p className="font-body text-base2 text-olive-deep">{dict.home.newsletterDone}</p>;

  return (
    <div className="flex gap-2">
      <Input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={dict.home.newsletterPlaceholder}
        aria-label={dict.home.newsletterPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button variant="olive" onClick={submit} disabled={state === "busy"} className="shrink-0 px-5">
        {dict.home.newsletterCta}
      </Button>
    </div>
  );
}
