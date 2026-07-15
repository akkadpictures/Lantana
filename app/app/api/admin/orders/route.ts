import { NextResponse, type NextRequest } from "next/server";
import { getOrders, updateOrderStatus } from "@/lib/db";
import { z } from "zod";

const patch = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
});

export async function GET() {
  return NextResponse.json({ orders: await getOrders() });
}

export async function PATCH(req: NextRequest) {
  let input;
  try { input = patch.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }
  await updateOrderStatus(input.id, input.status);
  return NextResponse.json({ ok: true });
}
