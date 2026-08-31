export type Locale = "en" | "ar";
export type Currency = "USD" | "SYP" | "TRY" | "SAR" | "QAR" | "AED" | "KWD";
export type CountryCode = "SY" | "TR" | "SA" | "QA" | "AE" | "KW" | "WW";

export interface LocalizedText { en: string; ar: string }

export interface FragranceNotes {
  top: LocalizedText[];
  heart: LocalizedText[];
  base: LocalizedText[];
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  size: string;
  concentration: string;
  collection: string;
  notes: FragranceNotes;
  accord: LocalizedText;
  image: string;
  gallery: string[];
  basePriceUSD: number;
  prices: Partial<Record<Currency, number>>;
  inventory: number;
  featured: boolean;
  hero?: boolean;
  status: "active" | "draft" | "archived";
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: LocalizedText;
  image: string;
  size: string;
  unitPriceUSD: number;
  qty: number;
}

export type PaymentMethod = "stripe" | "myfatoorah" | "cod" | "bank_transfer" | "whatsapp";
/**
 * `awaiting_confirmation` is the resting state of every unpaid Syrian order:
 * the record exists, but no stock is reserved until a human confirms it on
 * WhatsApp. Nothing else in the app may decrement inventory.
 */
export type OrderStatus =
  | "awaiting_confirmation"
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  currency: Currency;
  country: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  customer: {
    name: string; email: string; phone: string;
    address: string; city: string; country: string; notes?: string;
  };
  items: { productId: string; name: string; qty: number; unitPrice: number }[];
  /** Origin IP, kept only for abuse throttling. Never shown to customers. */
  ip?: string | null;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  minSubtotalUSD: number;
}

export interface ShippingRate {
  country: CountryCode;
  label: LocalizedText;
  priceUSD: number;
  etaDays: [number, number];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  body: string;
  approved: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  image: string;
  publishedAt: string;
}
