import { NextResponse, type NextRequest } from "next/server";
import { supa, hasDB } from "@/lib/supabase";

/**
 * Shop-floor terminal API.
 *
 * The staff terminal at /pos-app.html talks only to this route. It is public by
 * design — the shop tablet has no admin session — so the staff PIN is checked on
 * every call, and the payload is deliberately narrow: selling price and stock go
 * out, one sale comes in. Cost, margin, capital, expenses and history never
 * cross this boundary, so a leaked PIN exposes the price list, nothing more.
 */

export const dynamic = "force-dynamic";

const ROW_ID = "main";

type Item = { id: string; qty: number };

type Product = {
  id: string; en: string; ar: string; size: string;
  price: number; cost: number; stock: number; active?: boolean;
};

type State = {
  settings: Record<string, unknown> & {
    pinStaff?: string; pin?: string; base?: string; branch?: string;
    footer?: string; rates?: Record<string, number>; posHolder?: string;
  };
  products: Product[];
  sales: unknown[];
};

async function loadState(): Promise<State | null> {
  const { data, error } = await supa()
    .from("accounting_state").select("state").eq("id", ROW_ID).maybeSingle();
  if (error || !data?.state) return null;
  return data.state as State;
}

/* The owner PIN is accepted too, so he can check the terminal without a second code. */
function pinOk(state: State, pin: string | null) {
  if (!pin) return false;
  const staff = String(state.settings.pinStaff ?? "");
  const owner = String(state.settings.pin ?? "");
  return (staff !== "" && pin === staff) || (owner !== "" && pin === owner);
}

function catalogue(state: State) {
  const day = new Date().toISOString().slice(0, 10);
  return {
    base: state.settings.base ?? "USD",
    branch: state.settings.branch ?? "",
    footer: state.settings.footer ?? "",
    rates: state.settings.rates ?? { USD: 1 },
    /* cost is dropped here, not merely hidden in the UI */
    products: (state.products ?? [])
      .filter((p) => p.active !== false)
      .map((p) => ({ id: p.id, en: p.en, ar: p.ar, size: p.size, price: p.price, stock: p.stock })),
    /* only the current day, so the terminal cannot be used to read back the month */
    today: (state.sales ?? [])
      .filter((s) => (s as { date?: string }).date === day)
      .map((s) => s as Record<string, unknown>)
      .reverse(),
  };
}

export async function GET(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const state = await loadState();
  if (!state) return NextResponse.json({ error: "no_state" }, { status: 500 });
  if (!pinOk(state, req.nextUrl.searchParams.get("pin")))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  return NextResponse.json(catalogue(state));
}

export async function POST(req: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });

  const body = await req.json().catch(() => null);
  const state = await loadState();
  if (!state) return NextResponse.json({ error: "no_state" }, { status: 500 });
  if (!pinOk(state, body?.pin ?? null))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items: Item[] = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: "empty_sale" }, { status: 400 });

  const rates = state.settings.rates ?? { USD: 1 };
  const cur = typeof body.cur === "string" && rates[body.cur] ? body.cur : "USD";
  const rate = rates[cur] ?? 1;

  /* Prices and stock are read from the stored state, never from the request, so a
     tampered payload cannot sell at its own price or past the shelf. */
  const lines = [];
  for (const it of items) {
    const p = state.products.find((x) => x.id === it.id);
    const qty = Math.floor(Number(it.qty));
    if (!p || !Number.isFinite(qty) || qty <= 0)
      return NextResponse.json({ error: "bad_item" }, { status: 400 });
    if (qty > p.stock)
      return NextResponse.json({ error: "out_of_stock", product: p.ar, available: p.stock }, { status: 409 });
    lines.push({
      id: p.id, name: p.ar, en: p.en, size: p.size, qty,
      priceUSD: p.price, costUSD: p.cost, price: p.price * rate,
    });
  }

  const grossCur = lines.reduce((t, l) => t + l.price * l.qty, 0);
  const discount = Math.min(Math.max(Number(body.discount) || 0, 0), grossCur);
  const total = grossCur - discount;

  const now = new Date();
  const nextNo = Number(state.settings.invNo ?? 1001);
  const sale = {
    id: `pos-${now.getTime().toString(36)}`,
    no: String(nextNo),
    date: now.toISOString().slice(0, 10),
    time: now.toISOString().slice(11, 16),
    customer: typeof body.customer === "string" ? body.customer.slice(0, 80) : "",
    phone: typeof body.phone === "string" ? body.phone.slice(0, 40) : "",
    cur, rate,
    method: typeof body.method === "string" ? body.method.slice(0, 20) : "نقدي",
    discount, total, totalUSD: total / rate,
    settled: false,
    holder: state.settings.posHolder ?? "المحل",
    source: "pos",
    items: lines,
  };

  const sold = new Map<string, number>();
  for (const l of lines) sold.set(l.id, (sold.get(l.id) ?? 0) + l.qty);

  const next: State = {
    ...state,
    settings: { ...state.settings, invNo: nextNo + 1 },
    products: state.products.map((p) =>
      sold.has(p.id) ? { ...p, stock: p.stock - (sold.get(p.id) as number) } : p
    ),
    sales: [...(state.sales ?? []), sale],
  };

  const { error } = await supa()
    .from("accounting_state")
    .upsert({ id: ROW_ID, state: next, updated_at: now.toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sale, products: catalogue(next).products });
}
