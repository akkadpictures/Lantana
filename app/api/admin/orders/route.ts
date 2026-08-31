import { NextResponse, type NextRequest } from "next/server";
import { getOrder, getOrders, updateOrderStatus, adjustInventory } from "@/lib/db";
import { z } from "zod";

const patch = z.object({
  id: z.string().min(1),
  status: z.enum([
    "awaiting_confirmation", "pending", "paid", "processing", "shipped", "delivered", "cancelled",
  ]),
});

export async function GET() {
  return NextResponse.json({ orders: await getOrders() });
}

export async function PATCH(req: NextRequest) {
  let input;
  try { input = patch.parse(await req.json()); } catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }

  const current = await getOrder(input.id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });

  /* Stock is deducted exactly once, at the moment an awaiting order stops
     awaiting. Cancelling one never touched inventory, so nothing is returned. */
  const leavingLimbo =
    current.status === "awaiting_confirmation" &&
    input.status !== "awaiting_confirmation" &&
    input.status !== "cancelled";

  await updateOrderStatus(input.id, input.status);

  if (leavingLimbo) {
    for (const line of current.items) await adjustInventory(line.productId, -line.qty);
  }

  return NextResponse.json({ ok: true, inventoryAdjusted: leavingLimbo });
}
