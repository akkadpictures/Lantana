"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/admin/Shell";
import { Card } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

interface Item {
  id?: string;
  image: string;
  title_en: string;
  title_ar: string;
  caption_en: string;
  caption_ar: string;
  href: string;
  active: boolean;
}

const blank: Item = { image: "", title_en: "", title_ar: "", caption_en: "", caption_ar: "", href: "", active: true };

export default function AdminGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const uploadFor = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => setItems((d.items ?? []).map((x: Item) => ({ ...blank, ...x }))))
      .catch(() => setMsg("Couldn't load the gallery."))
      .finally(() => setLoading(false));
  }, []);

  function update(i: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function move(i: number, dir: -1 | 1) {
    setItems((arr) => {
      const next = [...arr];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function remove(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }
  function add() {
    setItems((arr) => [...arr, { ...blank }]);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const i = uploadFor.current;
    e.target.value = "";
    if (!file || i == null) return;
    update(i, { image: "Uploading…" });
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
    if (r?.url) update(i, { image: r.url });
    else { update(i, { image: "" }); setMsg("Upload failed — check the image is under 5MB (JPG/PNG/WebP)."); }
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items }),
    }).then((x) => x.json()).catch(() => null);
    setSaving(false);
    setMsg(r?.ok ? "Saved. The live gallery updates within a minute." : "Save failed. Please try again.");
  }

  return (
    <Shell title="Gallery">
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl font-body text-[0.9rem] text-ink/60">
          Manage the images shown on the storefront gallery. Reorder with the arrows, edit titles and
          captions in both languages, and add or remove frames. Changes go live after you save.
        </p>
        <div className="flex items-center gap-2">
          {msg && <span className="font-body text-[0.8rem] text-ink/55">{msg}</span>}
          <button onClick={add} className="rounded-full border border-ink/15 px-4 py-2 font-body text-[0.85rem] text-ink transition-colors hover:bg-ink/5">+ Add image</button>
          <button onClick={save} disabled={saving} className="rounded-full bg-olive px-5 py-2 font-body text-[0.85rem] text-ivory transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <Card><p className="font-body text-sm text-ink/50">Loading…</p></Card>
      ) : items.length === 0 ? (
        <Card><p className="font-body text-sm text-ink/50">No images yet. Click “Add image” to start.</p></Card>
      ) : (
        <div className="space-y-4">
          {items.map((it, i) => (
            <Card key={i} className="!p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Preview + order */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-ink/60 transition-colors hover:bg-ink/5 disabled:opacity-30" aria-label="Move up">↑</button>
                    <span className="text-center font-body text-[11px] text-ink/40">{i + 1}</span>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-ink/60 transition-colors hover:bg-ink/5 disabled:opacity-30" aria-label="Move down">↓</button>
                  </div>
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-[#f6f4ee]">
                    {it.image && it.image !== "Uploading…" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center px-2 text-center font-body text-[10px] text-ink/40">{it.image === "Uploading…" ? "Uploading…" : "No image"}</span>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Field label="Image URL" value={it.image} onChange={(v) => update(i, { image: v })}
                    action={<button onClick={() => { uploadFor.current = i; fileInput.current?.click(); }} className="whitespace-nowrap rounded-md bg-ink/5 px-2.5 py-1 text-[11px] text-ink/70 hover:bg-ink/10">Upload</button>} />
                  <Field label="Link (optional, e.g. product/moon)" value={it.href} onChange={(v) => update(i, { href: v })} />
                  <Field label="Title (EN)" value={it.title_en} onChange={(v) => update(i, { title_en: v })} />
                  <Field label="العنوان (AR)" value={it.title_ar} onChange={(v) => update(i, { title_ar: v })} rtl />
                  <Field label="Caption (EN)" value={it.caption_en} onChange={(v) => update(i, { caption_en: v })} />
                  <Field label="الوصف (AR)" value={it.caption_ar} onChange={(v) => update(i, { caption_ar: v })} rtl />
                </div>

                {/* Controls */}
                <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 font-body text-[0.8rem] text-ink/60">
                    <input type="checkbox" checked={it.active} onChange={(e) => update(i, { active: e.target.checked })} className="accent-olive" />
                    Visible
                  </label>
                  <button onClick={() => remove(i)} className="rounded-md px-2 py-1 font-body text-[0.8rem] text-red-600/80 transition-colors hover:bg-red-50">Remove</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Field({ label, value, onChange, action, rtl }: { label: string; value: string; onChange: (v: string) => void; action?: React.ReactNode; rtl?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-[11px] uppercase tracking-[0.12em] text-ink/45">{label}</span>
      <span className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={rtl ? "rtl" : "ltr"}
          className={cn("w-full rounded-lg border border-ink/12 bg-white px-3 py-2 font-body text-[0.9rem] text-ink outline-none transition-colors focus:border-olive", rtl && "text-right")}
        />
        {action}
      </span>
    </label>
  );
}
