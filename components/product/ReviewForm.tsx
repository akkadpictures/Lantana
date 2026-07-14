"use client";

import { useState } from "react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n";

export function ReviewForm({ productId, dict }: { productId: string; dict: Dictionary }) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function submit() {
    if (!author || !body || state === "busy") return;
    setState("busy");
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, author, body, rating }),
    }).catch(() => null);
    setState("done");
  }

  if (state === "done") return <p className="text-center font-body text-base2 text-olive-deep">{dict.product.reviewThanks}</p>;

  return (
    <div className="space-y-4 border hairline bg-ivory-soft/60 p-6">
      <p className="eyebrow">{dict.product.writeReview}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rev-name">{dict.product.yourName}</Label>
          <Input id="rev-name" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={80} />
        </div>
        <div>
          <Label>★</Label>
          <div className="flex gap-1 py-2.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} / 5`} onClick={() => setRating(n)} className={`text-d5 transition-colors ${n <= rating ? "text-olive" : "text-ink/20"}`}>
                ✦
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="rev-body">{dict.product.yourReview}</Label>
        <Textarea id="rev-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} />
      </div>
      <Button variant="olive" onClick={submit} disabled={state === "busy" || !author || !body}>
        {dict.product.submitReview}
      </Button>
    </div>
  );
}
