import { NextResponse, type NextRequest } from "next/server";
import { couponSchema } from "@/lib/validation";
import { getCoupons, upsertCoupon, deleteCoupon } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ coupons: await getCoupons() });
}
export async function POST(req: NextRequest) {
  let input;
  try { input = couponSchema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await upsertCoupon(input);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
  await deleteCoupon(code);
  return NextResponse.json({ ok: true });
}
