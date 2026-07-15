import { NextResponse, type NextRequest } from "next/server";
import { productSchema } from "@/lib/validation";
import { getProducts, upsertProduct, deleteProduct } from "@/lib/db";
import type { Product } from "@/types";

export async function GET() {
  return NextResponse.json({ products: await getProducts({ includeDrafts: true }) });
}

export async function POST(req: NextRequest) {
  let input;
  try { input = productSchema.parse(await req.json()); } catch (e) { return NextResponse.json({ error: "invalid_input", detail: String(e) }, { status: 400 }); }
  await upsertProduct(input as Product);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
