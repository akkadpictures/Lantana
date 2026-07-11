"use client";

import { useState } from "react";
import Image from "next/image";
import { Table, Badge, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import type { Collection, Currency, Product } from "@/types";

const CURRENCIES: Currency[] = ["USD", "SYP", "AED", "SAR", "QAR", "KWD"];

function blank(): Product {
  return {
    id: `p-${crypto.randomUUID().slice(0, 8)}`, slug: "", name: { en: "", ar: "" },
    tagline: { en: "", ar: "" }, description: { en: "", ar: "" }, size: "50 ml",
    concentration: "Eau de Parfum", collection: "signature", accord: { en: "", ar: "" },
    notes: { top: [], heart: [], base: [] }, image: "/images/products/moon.jpg", gallery: [],
    basePriceUSD: 130, prices: {}, inventory: 0, featured: false, hero: false,
    status: "draft", createdAt: new Date().toISOString(),
  };
}

export function ProductsClient({ initial, collections }: { initial: Product[]; collections: Collection[] }) {
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(p: Product) {
    setSaving(true);
    const payload = { ...p, slug: p.slug || slugify(p.name.en) };
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setProducts((list) => { const i = list.findIndex((x) => x.id === p.id); return i >= 0 ? list.map((x) => (x.id === p.id ? payload : x)) : [payload, ...list]; });
      setEditing(null);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setProducts((list) => list.filter((p) => p.id !== id));
  }

  if (editing) {
    const p = editing;
    const upd = (patch: Partial<Product>) => setEditing({ ...p, ...patch });
    return (
      <Card className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl">{initial.some((x) => x.id === p.id) ? "Edit product" : "New product"}</h2>
          <button onClick={() => setEditing(null)} className="font-body text-sm text-ink/50 hover:text-ink">Cancel</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Name (EN)</Label><Input value={p.name.en} onChange={(e) => upd({ name: { ...p.name, en: e.target.value } })} /></div>
          <div><Label>Name (AR)</Label><Input dir="rtl" value={p.name.ar} onChange={(e) => upd({ name: { ...p.name, ar: e.target.value } })} /></div>
          <div><Label>Tagline (EN)</Label><Input value={p.tagline.en} onChange={(e) => upd({ tagline: { ...p.tagline, en: e.target.value } })} /></div>
          <div><Label>Tagline (AR)</Label><Input dir="rtl" value={p.tagline.ar} onChange={(e) => upd({ tagline: { ...p.tagline, ar: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Description (EN)</Label><Textarea value={p.description.en} onChange={(e) => upd({ description: { ...p.description, en: e.target.value } })} /></div>
          <div className="sm:col-span-2"><Label>Description (AR)</Label><Textarea dir="rtl" value={p.description.ar} onChange={(e) => upd({ description: { ...p.description, ar: e.target.value } })} /></div>
          <div><Label>Slug</Label><Input value={p.slug} placeholder={slugify(p.name.en)} onChange={(e) => upd({ slug: e.target.value })} /></div>
          <div><Label>Size</Label><Input value={p.size} onChange={(e) => upd({ size: e.target.value })} /></div>
          <div>
            <Label>Collection</Label>
            <Select value={p.collection} onChange={(e) => upd({ collection: e.target.value })}>
              {collections.map((c) => <option key={c.id} value={c.slug}>{c.name.en}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={p.status} onChange={(e) => upd({ status: e.target.value as Product["status"] })}>
              <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </Select>
          </div>
          <div><Label>Image path</Label><Input value={p.image} onChange={(e) => upd({ image: e.target.value })} /></div>
          <div><Label>Inventory</Label><Input type="number" value={p.inventory} onChange={(e) => upd({ inventory: parseInt(e.target.value) || 0 })} /></div>
        </div>

        <div className="mt-6">
          <p className="mb-2 font-body text-[11px] uppercase tracking-wide2 text-ink/50">Pricing per currency — leave blank to auto-convert from USD</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Base price (USD)</Label><Input type="number" value={p.basePriceUSD} onChange={(e) => upd({ basePriceUSD: parseFloat(e.target.value) || 0 })} /></div>
            {CURRENCIES.filter((c) => c !== "USD").map((c) => (
              <div key={c}>
                <Label>{c}</Label>
                <Input type="number" value={p.prices[c] ?? ""} placeholder="auto"
                  onChange={(e) => { const v = e.target.value; const prices = { ...p.prices }; if (v === "") delete prices[c]; else prices[c] = parseFloat(v); upd({ prices }); }} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={p.featured} onChange={(e) => upd({ featured: e.target.checked })} /> Featured</label>
          <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={p.hero ?? false} onChange={(e) => upd({ hero: e.target.checked })} /> Hero</label>
        </div>

        <div className="mt-8 flex gap-3">
          <Button onClick={() => save(p)} disabled={saving || !p.name.en}>{saving ? "Saving…" : "Save product"}</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-5"><Button variant="olive" onClick={() => setEditing(blank())}>+ New product</Button></div>
      <Table head={["", "Name", "Collection", "Price (USD)", "Stock", "Status", ""]}>
        {products.map((p) => (
          <tr key={p.id} className="border-b hairline last:border-0">
            <td className="px-4 py-2"><div className="relative h-10 w-10 bg-ivory-deep"><Image src={p.image} alt="" fill sizes="40px" className="object-cover" /></div></td>
            <td className="px-4 py-3 font-medium">{p.name.en}<span className="block text-xs text-ink/40">{p.size}</span></td>
            <td className="px-4 py-3 text-ink/60">{p.collection}</td>
            <td className="px-4 py-3">${p.basePriceUSD}</td>
            <td className="px-4 py-3">{p.inventory}</td>
            <td className="px-4 py-3"><Badge tone={p.status === "active" ? "green" : p.status === "draft" ? "amber" : "grey"}>{p.status}</Badge></td>
            <td className="px-4 py-3">
              <button className="text-olive-deep underline" onClick={() => setEditing(p)}>Edit</button>
              <button className="ms-3 text-red-800 underline" onClick={() => remove(p.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
