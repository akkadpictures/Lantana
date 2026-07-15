import { NextResponse, type NextRequest } from "next/server";
import { getCoupon } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ code: z.string().max(40), subtotalUSD: z.number().min(0) });

export async function POST(req: NextRequest) {
  let input;
  try { input = schema.parse(await req.json()); } catch { return NextResponse.json({ valid: false }, { status: 400 }); }
  const c = await getCoupon(input.code);
  if (!c || input.subtotalUSD < c.minSubtotalUSD) return NextResponse.json({ valid: false });
  const discountUSD = c.type === "percent" ? Math.round(input.subtotalUSD * (c.value / 100) * 100) / 100 : c.value;
  return NextResponse.json({ valid: true, code: c.code, discountUSD });
}
