"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Clears the cart on arrival (covers Stripe redirect returns). */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
