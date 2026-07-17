"use client";

import { useRef, useState } from "react";
import Image from "next/image";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || "upload_failed");
  return json.url as string;
}

/** Single image field with an Upload button + live preview. */
export function ImageUpload({
  value,
  onChange,
  label = "Upload image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handle(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setErr(""); setBusy(true);
    try { onChange(await uploadFile(file)); } catch { setErr("Upload failed — try a JPG/PNG/WebP under 5MB."); }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ivory-deep">
        {value ? <Image src={value} alt="" fill sizes="80px" className="object-cover" /> : null}
      </div>
      <div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handle(e.target.files)} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="border hairline bg-white px-4 py-2 font-body text-base2 hover:bg-ivory-deep disabled:opacity-50"
        >
          {busy ? "Uploading…" : label}
        </button>
        {err ? <p className="mt-1 font-body text-sm2 text-red-800">{err}</p> : null}
      </div>
    </div>
  );
}

/** Multi-image gallery with upload + remove. */
export function GalleryUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setErr(""); setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try { added.push(await uploadFile(file)); } catch { setErr("Some images failed — JPG/PNG/WebP under 5MB only."); }
    }
    if (added.length) onChange([...value, ...added]);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative h-20 w-20 overflow-hidden bg-ivory-deep">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute inset-0 hidden items-center justify-center bg-black/50 font-body text-sm2 text-white group-hover:flex"
            >
              Remove
            </button>
          </div>
        ))}
        <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handle(e.target.files)} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="flex h-20 w-20 items-center justify-center border hairline bg-white font-body text-sm2 text-ink/60 hover:bg-ivory-deep disabled:opacity-50"
        >
          {busy ? "…" : "+ Add"}
        </button>
      </div>
      {err ? <p className="mt-1 font-body text-sm2 text-red-800">{err}</p> : null}
    </div>
  );
}
