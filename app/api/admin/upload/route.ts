import { NextResponse, type NextRequest } from "next/server";
import { supa, hasDB } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB — matches the bucket limit
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * Admin image upload. Protected by the /api/admin middleware guard.
 * Accepts multipart form-data with a single "file" field and returns
 * the public URL of the stored image.
 */
export async function POST(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 400 });

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const safeBase = (file.name.replace(/\.[^.]+$/, "") || "image")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .slice(0, 40);
  const path = `${Date.now()}-${safeBase}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supa().storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return NextResponse.json({ error: "upload_failed", detail: error.message }, { status: 500 });

  const { data } = supa().storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
