import Stripe from "stripe";

let _stripe: Stripe | null = null;
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

export function stripe(): Stripe {
  if (!hasStripe) throw new Error("Stripe is not configured — set STRIPE_SECRET_KEY.");
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  return _stripe;
}

/** Zero/three-decimal currency handling for Stripe amounts. */
export function toStripeAmount(amount: number, currency: string): number {
  const three = ["KWD", "BHD", "OMR", "JOD"];
  const zero = ["JPY", "KRW"];
  const c = currency.toUpperCase();
  if (three.includes(c)) return Math.round(amount * 1000);
  if (zero.includes(c)) return Math.round(amount);
  return Math.round(amount * 100);
}

export const STRIPE_SUPPORTED = ["USD", "AED", "SAR", "QAR", "KWD"];
