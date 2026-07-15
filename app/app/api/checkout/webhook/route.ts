import { NextResponse, type NextRequest } from "next/server";
import { hasStripe, stripe } from "@/lib/stripe";
import { updateOrderStatus, getOrder, adjustInventory } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!hasStripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { order_id?: string } };
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const order = await getOrder(orderId);
      if (order && order.status === "pending") {
        await updateOrderStatus(orderId, "paid");
        for (const l of order.items) await adjustInventory(l.productId, -l.qty);
      }
    }
  }
  return NextResponse.json({ received: true });
}
