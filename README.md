# LANTANA — Maison de Parfum

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/lantana&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Paste%20your%20three%20Supabase%20keys%20(everything%20else%20is%20optional)&project-name=lantana&repository-name=lantana)

> One-click deploy. The site builds and runs with **zero configuration** — it falls back to a
> built-in catalog and cash-on-delivery / bank-transfer checkout. Paste your Supabase keys to
> switch on the live database; paste Stripe keys later to switch on card payments. No commands.

Production-ready, bilingual (English LTR / Arabic RTL) luxury perfume e-commerce platform.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Zustand ·
Supabase (Postgres) · Stripe · MyFatoorah.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Runs with zero configuration (bundled catalog, no live payments). See **DEPLOYMENT.md**
to enable the database, payments and admin for production.

## Features

**Storefront** — home, shop (filter + sort), product detail (olfactive pyramid, reviews,
related, recently-viewed), collections, cart, wishlist, live search, country-aware checkout,
order success, the Maison, journal, contact, and legal pages. Fully bilingual with automatic
RTL, per-country currency and pricing, and motion throughout (respecting reduced-motion).

**Backend** — Supabase data layer with a catalog fallback, server-validated checkout,
Stripe + MyFatoorah + COD + bank transfer, coupons, shipping, inventory, reviews, newsletter.
All API input validated with Zod; routes rate-limited; security headers set.

**Admin** (`/admin`) — analytics overview, orders with status workflow, customers, products
(bilingual editor + per-currency pricing), inventory, country pricing matrix, collections,
shipping, coupons, review moderation, journal, and integration status. Protected by an
HTTP-only JWT session + middleware guard.

## Structure

```
app/[locale]/…   localized storefront routes (en | ar)
app/admin/…      admin dashboard
app/api/…        storefront + admin API routes
components/…      brand · layout · product · cart · checkout · search · admin · ui · motion
lib/…            catalog · db · currency · geo · auth · stripe · validation · i18n · seo
store/…          cart · wishlist · recently-viewed (Zustand + persist)
supabase/…       schema.sql · seed.sql
public/images/…  products · brand (real assets)
```

## Environment

Copy `.env.example` to `.env.local` and fill in as needed. Every integration is optional;
the site degrades gracefully when a key is absent.
