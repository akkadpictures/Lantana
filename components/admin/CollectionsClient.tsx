"use client";

import { useState } from "react";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import type { Collection } from "@/types";

export function CollectionsClient({ initial }: { initial: Collection[] }) {
  const [collections, setCollections] = useState(initial);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [saving, setSaving] = useState(false);

  function blank(): Collection {
    return { id: `col-${crypto.randomUUID().slice(0, 8)}`, slug: "", name: { en: "", ar: "" }, description: { en: "", ar: "" }, image: "/images/products/yasmeen.jpg" };
  }
  async function save(c: Collection) {
    setSaving(true);
    const payload = { ...c, slug: c.slug || slugify(c.name.en) };
    const res = await fetch("/api/admin/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setCollections((list) => { const i = list.findIndex((x) => x.id === c.id); return i >= 0 ? list.map((x) => (x.id === c.id ? payload : x)) : [...list, payload]; });
      setEditing(null);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this collection?")) return;
    await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
    setCollections((list) => list.filter((c) => c.id !== id));
  }

  if (editing) {
    const c = editing;
    const upd = (patch: Partial<Collection>) => setEditing({ ...c, ...patch });
    return (
      <Card className="max-w-2xl">
        <h2 className="mb-6 font-display text-d5">{initial.some((x) => x.id === c.id) ? "Edit collection" : "New collection"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name (EN)</Label><Input value={c.name.en} onChange={(e) => upd({ name: { ...c.name, en: e.target.value } })} /></div>
          <div><Label>Name (AR)</Label><Input dir="rtl" value={c.name.ar} onChange={(e) => upd({ name: { ...c.name, ar: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={c.description.en} onChange={(e) => upd({ description: { ...c.description, en: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Description (AR)</Label><Textarea dir="rtl" value={c.description.ar} onChange={(e) => upd({ description: { ...c.description, ar: e.target.value } })} /></div>
          <div><Label>Slug</Label><Input value={c.slug} placeholder={slugify(c.name.en)} onChange={(e) => upd({ slug: e.target.value })} /></div>
          <div><Label>Image path</Label><Input value={c.image} onChange={(e) => upd({ image: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => save(c)} disabled={saving || !c.name.en}>{saving ? "Saving…" : "Save"}</Button>
          <button onClick={() => setEditing(null)} className="font-body text-base2 text-ink/50">Cancel</button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-5"><Button variant="olive" onClick={() => setEditing(blank())}>+ New collection</Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <Card key={c.id}>
            <h3 className="font-display text-lead">{c.name.en}</h3>
            <p className="mt-1 font-body text-sm2 text-ink/50">{c.slug}</p>
            <p className="mt-2 font-body text-base2 text-ink/60 line-clamp-2">{c.description.en}</p>
            <div className="mt-4 flex gap-3 font-body text-base2">
              <button className="text-olive-deep underline" onClick={() => setEditing(c)}>Edit</button>
              <button className="text-red-800 underline" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
