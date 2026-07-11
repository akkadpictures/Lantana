import { NextResponse, type NextRequest } from "next/server";
import { reviewSchema } from "@/lib/validation";
import { addReview, getProductById } from "@/lib/db";

export async function POST(req: NextRequest) {
  let input;
  try { input = reviewSchema.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  const product = await getProductById(input.productId);
  if (!product) return NextResponse.json({ error: "unknown_product" }, { status: 404 });
  await addReview(input);
  return NextResponse.json({ ok: true });
}
