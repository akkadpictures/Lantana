"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/admin/Shell";
import { Card } from "@/components/admin/ui";
import { supaBrowser } from "@/lib/supabaseBrowser";
import { uploadImage } from "@/lib/uploadImage";

interface Item { image: string; title_en: string; title_ar: string; caption_en: string; caption_ar: string; href: string; active: boolean; }
const blank: Item = { image: "", title_en: "", title_ar: "", caption_en: "", caption_ar: "", href: "", active: true };

/** Placeholder held in `image` while a file is being uploaded. */
const PENDING = "…";

export default function AdminGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pct, setPct] = useState<Record<number, number>>({});
  const forIdx = useRef<number | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/gallery").then((r) => r.json())
      .then((d) => setItems((d.items ?? []).map((x: Item) => ({ ...blank, ...x }))))
      .finally(() => setLoading(false));
  }, []);

  const set = (i: number, p: Partial<Item>) => setItems((a) => a.map((it, k) => (k === i ? { ...it, ...p } : it)));
  const move = (i: number, d: number) => setItems((a) => { const n = [...a]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });

  /**
   * Uploads straight from the browser to Supabase Storage. The old path posted
   * the file to /api/admin/upload, where Vercel's 4.5MB serverless body limit
   * silently rejected anything larger. The API route stays as a fallback for
   * when the public Supabase env vars are missing.
   */
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    const i = forIdx.current;
    e.target.value = "";
    if (!f || i == null) return;

    const previous = items[i]?.image ?? "";
    setMsg("");
    set(i, { image: PENDING });
    setPct((p) => ({ ...p, [i]: 0 }));

    const track = (n: number) => setPct((p) => ({ ...p, [i]: n }));

    try {
      const client = supaBrowser();
      let url: string;

      if (client) {
        url = (await uploadImage(client, f, { onProgress: track })).url;
      } else {
        const fd = new FormData();
        fd.append("file", f);
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((x) => x.json());
        if (!r?.url) throw new Error(r?.error || "upload_failed");
        url = r.url as string;
      }

      set(i, { image: url });
      setMsg("Image uploaded — remember to save.");
    } catch (err) {
      // Restore whatever was there before so a failed upload never wipes the row.
      set(i, { image: previous });
      setMsg(err instanceof Error && err.message ? err.message : "Upload failed — try another image.");
    } finally {
      setPct((p) => { const n = { ...p }; delete n[i]; return n; });
    }
  }

  async function save() {
    if (items.some((it) => it.image === PENDING)) {
      setMsg("Wait for uploads to finish before saving.");
      return;
    }
    setSaving(true); setMsg("");
    const r = await fetch("/api/admin/gallery", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items }) }).then((x) => x.json()).catch(() => null);
    setSaving(false);
    setMsg(r?.ok ? "Saved — live gallery updates within a minute." : (r?.error ? `Save failed: ${r.error}` : "Save failed, try again."));
  }

  return (
    <Shell title="Gallery">
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={upload} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl font-body text-sm text-ink/60">Edit the storefront gallery — reorder, retitle in both languages, upload, add or remove. Save to publish.</p>
        <div className="flex items-center gap-2">
          {msg && <span className="font-body text-xs text-ink/55">{msg}</span>}
          <button onClick={() => setItems((a) => [...a, { ...blank }])} className="rounded-full border border-ink/15 px-4 py-2 font-body text-sm text-ink hover:bg-ink/5">+ Add</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-olive px-5 py-2 font-body text-sm text-ivory hover:opacity-90 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>

      {loading ? <Card><p className="text-sm text-ink/50">Loading…</p></Card> : items.length === 0 ? <Card><p className="text-sm text-ink/50">No images. Click “+ Add”.</p></Card> : (
        <div className="space-y-4">
          {items.map((it, i) => (
            <Card key={i} className="!p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 hover:bg-ink/5 disabled:opacity-30">↑</button>
                    <span className="text-xs text-ink/40">{i + 1}</span>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 hover:bg-ink/5 disabled:opacity-30">↓</button>
                  </div>
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-[#f6f4ee]">
                    {it.image && it.image !== PENDING
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={it.image} alt="" className="h-full w-full object-cover" />
                      : <span className="grid h-full w-full place-items-center text-[10px] text-ink/40">{it.image === PENDING ? `${pct[i] ?? 0}%` : "no image"}</span>}
                  </div>
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <F label="Image URL" v={it.image} on={(v) => set(i, { image: v })} act={<button onClick={() => { forIdx.current = i; file.current?.click(); }} className="rounded-md bg-ink/5 px-2.5 py-1 text-[11px] hover:bg-ink/10">Upload</button>} />
                  <F label="Link (e.g. product/moon)" v={it.href} on={(v) => set(i, { href: v })} />
                  <F label="Title (EN)" v={it.title_en} on={(v) => set(i, { title_en: v })} />
                  <F label="العنوان (AR)" v={it.title_ar} on={(v) => set(i, { title_ar: v })} rtl />
                  <F label="Caption (EN)" v={it.caption_en} on={(v) => set(i, { caption_en: v })} />
                  <F label="الوصف (AR)" v={it.caption_ar} on={(v) => set(i, { caption_ar: v })} rtl />
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/60"><input type="checkbox" checked={it.active} onChange={(e) => set(i, { active: e.target.checked })} className="accent-olive" />Visible</label>
                  <button onClick={() => setItems((a) => a.filter((_, k) => k !== i))} className="rounded-md px-2 py-1 text-sm text-red-600/80 hover:bg-red-50">Remove</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

function F({ label, v, on, act, rtl }: { label: string; v: string; on: (s: string) => void; act?: React.ReactNode; rtl?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-ink/45">{label}</span>
      <span className="flex items-center gap-2">
        <input value={v} onChange={(e) => on(e.target.value)} dir={rtl ? "rtl" : "ltr"} className="w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-olive" />
        {act}
      </span>
    </label>
  );
}
