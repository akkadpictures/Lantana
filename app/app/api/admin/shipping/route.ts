import { NextResponse, type NextRequest } from "next/server";
import { shippingSchema } from "@/lib/validation";
import { getShippingRates, upsertShippingRate } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ rates: await getShippingRates() });
}
export async function POST(req: NextRequest) {
  let input;
  try { input = shippingSchema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await upsertShippingRate(input);
  return NextResponse.json({ ok: true });
}
