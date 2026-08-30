import { NextResponse, type NextRequest } from "next/server";
import { supa, hasDB } from "@/lib/supabase";

const BUCKET = "product-images";

/**
 * Vercel caps a serverless function's request body at 4.5MB, so anything larger
 * never reaches this handler at all. We reject at 4MB to fail with a readable
 * message instead of an opaque platform-level error.
 *
 * This route is now only a FALLBACK. The admin panel uploads directly from the
 * browser to Supabase Storage (see lib/uploadImage.ts), which has no such cap.
 */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was received." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported format: ${file.type || "unknown"}.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1048576).toFixed(1);
    return NextResponse.json(
      { error: `This image is ${mb}MB. Server uploads are capped at 4MB — the admin panel normally uploads directly and has no such limit, so check that NEXT_PUBLIC_SUPABASE_ANON_KEY is set.` },
      { status: 413 }
    );
  }

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supa().storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
