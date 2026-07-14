"use client";

import { useState } from "react";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/types";

export function BlogClient({ initial }: { initial: BlogPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  function blank(): BlogPost {
    return { id: `b-${crypto.randomUUID().slice(0, 8)}`, slug: "", title: { en: "", ar: "" }, excerpt: { en: "", ar: "" }, body: { en: "", ar: "" }, image: "/images/products/yasmeen.jpg", publishedAt: new Date().toISOString() };
  }
  async function save(b: BlogPost) {
    setSaving(true);
    const payload = { ...b, slug: b.slug || slugify(b.title.en) };
    const res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setPosts((list) => { const i = list.findIndex((x) => x.id === b.id); return i >= 0 ? list.map((x) => (x.id === b.id ? payload : x)) : [payload, ...list]; });
      setEditing(null);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    setPosts((list) => list.filter((p) => p.id !== id));
  }

  if (editing) {
    const b = editing;
    const upd = (patch: Partial<BlogPost>) => setEditing({ ...b, ...patch });
    return (
      <Card className="max-w-3xl">
        <h2 className="mb-6 font-display text-d5">{initial.some((x) => x.id === b.id) ? "Edit article" : "New article"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Title (EN)</Label><Input value={b.title.en} onChange={(e) => upd({ title: { ...b.title, en: e.target.value } })} /></div>
          <div><Label>Title (AR)</Label><Input dir="rtl" value={b.title.ar} onChange={(e) => upd({ title: { ...b.title, ar: e.target.value } })} /></div>
          <div><Label>Excerpt (EN)</Label><Input value={b.excerpt.en} onChange={(e) => upd({ excerpt: { ...b.excerpt, en: e.target.value } })} /></div>
          <div><Label>Excerpt (AR)</Label><Input dir="rtl" value={b.excerpt.ar} onChange={(e) => upd({ excerpt: { ...b.excerpt, ar: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Body (EN)</Label><Textarea className="min-h-40" value={b.body.en} onChange={(e) => upd({ body: { ...b.body, en: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Body (AR)</Label><Textarea dir="rtl" className="min-h-40" value={b.body.ar} onChange={(e) => upd({ body: { ...b.body, ar: e.target.value } })} /></div>
          <div><Label>Slug</Label><Input value={b.slug} placeholder={slugify(b.title.en)} onChange={(e) => upd({ slug: e.target.value })} /></div>
          <div><Label>Image path</Label><Input value={b.image} onChange={(e) => upd({ image: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => save(b)} disabled={saving || !b.title.en}>{saving ? "Saving…" : "Publish"}</Button>
          <button onClick={() => setEditing(null)} className="font-body text-base2 text-ink/50">Cancel</button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-5"><Button variant="olive" onClick={() => setEditing(blank())}>+ New article</Button></div>
      <div className="space-y-3">
        {posts.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lead">{p.title.en}</h3>
              <p className="font-body text-sm2 text-ink/50">{new Date(p.publishedAt).toLocaleDateString("en-GB")} · {p.slug}</p>
            </div>
            <div className="flex gap-3 font-body text-base2">
              <button className="text-olive-deep underline" onClick={() => setEditing(p)}>Edit</button>
              <button className="text-red-800 underline" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
