import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(30),
  address: z.string().min(4).max(400),
  city: z.string().min(2).max(120),
  country: z.string().min(2).max(3),
  notes: z.string().max(1000).optional().or(z.literal("")),
  paymentMethod: z.enum(["stripe", "myfatoorah", "cod", "bank_transfer"]),
  couponCode: z.string().max(40).optional().or(z.literal("")),
  locale: z.enum(["en", "ar"]),
  items: z.array(z.object({ productId: z.string().min(1), qty: z.number().int().min(1).max(20) })).min(1).max(40),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  author: z.string().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(4).max(1200),
});

export const newsletterSchema = z.object({ email: z.string().email().max(200) });

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  message: z.string().min(4).max(3000),
});

const localizedText = z.object({ en: z.string(), ar: z.string() });

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).max(80),
  name: localizedText,
  tagline: localizedText,
  description: localizedText,
  size: z.string().min(1),
  concentration: z.string().min(1),
  collection: z.string().min(1),
  accord: localizedText,
  notes: z.object({
    top: z.array(localizedText),
    heart: z.array(localizedText),
    base: z.array(localizedText),
  }),
  image: z.string().min(1),
  gallery: z.array(z.string()),
  basePriceUSD: z.number().min(0),
  prices: z.record(z.string(), z.number()),
  inventory: z.number().int().min(0),
  featured: z.boolean(),
  hero: z.boolean().optional(),
  status: z.enum(["active", "draft", "archived"]),
  createdAt: z.string(),
});

export const couponSchema = z.object({
  code: z.string().min(2).max(40),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  active: z.boolean(),
  minSubtotalUSD: z.number().min(0),
});

export const shippingSchema = z.object({
  country: z.enum(["SY", "AE", "SA", "QA", "KW", "WW"]),
  label: localizedText,
  priceUSD: z.number().min(0),
  etaDays: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});
