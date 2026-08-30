import { NextResponse, type NextRequest } from "next/server";
import { supa, hasDB } from "@/lib/supabase";

/** Gallery CRUD. Protected by the /api/admin middleware guard. */

export async function GET() {
  if (!hasDB) return NextResponse.json({ items: [] });
  const { data, error } = await supa().from("gallery").select("*").order("sort", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const list = Array.isArray(body?.items) ? body.items : null;
  if (!list) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const rows = list
    .map((it: Record<string, unknown>) => ({
      image: String(it.image ?? "").trim(),
      title_en: String(it.title_en ?? "").trim(),
      title_ar: String(it.title_ar ?? "").trim(),
      caption_en: String(it.caption_en ?? "").trim(),
      caption_ar: String(it.caption_ar ?? "").trim(),
      href: String(it.href ?? "").trim().replace(/^\/+/, ""),
      active: it.active !== false,
    }))
    .filter((r: { image: string }) => r.image);

  // replace_gallery() clears and refills the table inside one transaction, so a
  // failure rolls back the delete and the existing gallery survives untouched.
  // The previous delete-then-insert pair could wipe the gallery permanently if
  // the insert failed after the delete had already committed.
  const { data, error } = await supa().rpc("replace_gallery", { items: rows });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: typeof data === "number" ? data : rows.length });
}
