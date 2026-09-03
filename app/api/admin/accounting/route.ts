import { NextResponse, type NextRequest } from "next/server";
import { supa, hasDB } from "@/lib/supabase";

/**
 * Back-office accounting store.
 * The panel at /admin/accounting keeps its whole state as one JSON snapshot so a
 * single read and a single write cover every screen. Reached only through this
 * route, which the /api/admin middleware guard already protects, so the table
 * itself stays service-role only and is never exposed to the browser.
 */

export const dynamic = "force-dynamic";

const ROW_ID = "main";

export async function GET() {
  if (!hasDB) return NextResponse.json({ state: null, updated_at: null });

  const { data, error } = await supa()
    .from("accounting_state")
    .select("state, updated_at")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ state: data?.state ?? null, updated_at: data?.updated_at ?? null });
}

export async function POST(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const state = body?.state;

  // A snapshot without products is either an empty boot or a corrupted payload;
  // writing it would erase a working ledger, so it is refused rather than saved.
  if (!state || !Array.isArray(state.products) || state.products.length === 0) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  const { error } = await supa()
    .from("accounting_state")
    .upsert({ id: ROW_ID, state, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, updated_at: new Date().toISOString() });
}
