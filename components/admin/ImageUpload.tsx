"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { supaBrowser } from "@/lib/supabaseBrowser";
import { uploadImage } from "@/lib/uploadImage";

/**
 * Uploads a file straight from the browser to Supabase Storage, compressing it
 * to WebP first. Falls back to the old API route only when the public Supabase
 * env vars are missing — that path is still capped at ~4.5MB by Vercel.
 */
async function uploadFile(file: File, onProgress?: (p: number) => void): Promise<string> {
  const client = supaBrowser();

  if (client) {
    const result = await uploadImage(client, file, { onProgress });
    return result.url;
  }

  onProgress?.(10);
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  onProgress?.(100);
  if (!res.ok || !json.url) throw new Error(json.error || "upload_failed");
  return json.url as string;
}

function errorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : "";
  if (msg && !/^upload_failed$|^too_large$|^invalid_type$/.test(msg)) return msg;
  return "Upload failed — use a JPG, PNG or WebP image.";
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
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");

  async function handle(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setErr("");
    setBusy(true);
    setPct(0);
    try {
      onChange(await uploadFile(file, setPct));
    } catch (e) {
      setErr(errorText(e));
    }
    setBusy(false);
    setPct(0);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ivory-deep">
        {value ? <Image src={value} alt="" fill sizes="80px" className="object-cover" /> : null}
      </div>
      <div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="border hairline bg-white px-4 py-2 font-body text-base2 hover:bg-ivory-deep disabled:opacity-50"
        >
          {busy ? `Uploading… ${pct}%` : label}
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
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    setBusy(true);
    setPct(0);

    const list = Array.from(files);
    const added: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < list.length; i++) {
      try {
        const url = await uploadFile(list[i], (p) =>
          setPct(Math.round(((i + p / 100) / list.length) * 100))
        );
        added.push(url);
      } catch {
        failed.push(list[i].name);
      }
    }

    if (added.length) onChange([...value, ...added]);
    if (failed.length) setErr(`Failed: ${failed.join(", ")}`);

    setBusy(false);
    setPct(0);
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
        <input
          ref={ref}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="flex h-20 w-20 items-center justify-center border hairline bg-white font-body text-sm2 text-ink/60 hover:bg-ivory-deep disabled:opacity-50"
        >
          {busy ? `${pct}%` : "+ Add"}
        </button>
      </div>
      {err ? <p className="mt-1 font-body text-sm2 text-red-800">{err}</p> : null}
    </div>
  );
}
