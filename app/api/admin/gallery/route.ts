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
    .map((it: Record<string, unknown>, i: number) => ({
      image: String(it.image ?? "").trim(),
      title_en: String(it.title_en ?? "").trim(),
      title_ar: String(it.title_ar ?? "").trim(),
      caption_en: String(it.caption_en ?? "").trim(),
      caption_ar: String(it.caption_ar ?? "").trim(),
      href: String(it.href ?? "").trim().replace(/^\/+/, ""),
      sort: i,
      active: it.active !== false,
    }))
    .filter((r: { image: string }) => r.image);

  const db = supa();
  const { error: delErr } = await db.from("gallery").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (rows.length) {
    const { error: insErr } = await db.from("gallery").insert(rows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: rows.length });
}
