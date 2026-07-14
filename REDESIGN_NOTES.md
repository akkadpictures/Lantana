# LANTANA — redesign, July 2026

## What changed

**Identity**
- `app/icon.svg`, `app/apple-icon.png`, `components/brand/LantanaMark.tsx` and the header,
  mobile menu and footer now all render *the same* floret. The favicon was previously an
  unrelated four-circle drawing.
- `components/brand/Wordmark.tsx` is now vector, not a bitmap. The three PNG masters in
  `public/images/brand/` were corrupt contact-sheets; they have been regenerated as clean
  transparent lockups, and a new Open Graph card was produced.

**Typography**
- One scale, defined once in `tailwind.config.ts` (`micro → label → nav → sm2 → base2 →
  lead → d5 → d4 → d3 → d2 → d1`) and exposed as six classes in `globals.css`
  (`t-display`, `t-h1…t-h4`, `t-lead`, `t-body`, `t-small`, `t-nav`, `t-label`, `t-price`).
- Body size raised from 15px to 17px (18px in Arabic, which needs more room).
- Buttons are larger and now have `sm` / `md` / `lg` sizes.

**Pricing**
- Every stored price is the **Syrian home price**. Outside Syria the shelf price is ×3.
- The multiplier follows *where the visitor is* (`x-vercel-ip-country`), never the currency
  they select and never a cookie they can edit. The old country picker — which would have let
  anyone claim the Damascus price — is gone.
- Server-side checkout re-derives the tier from the same header, so the client total is still
  never trusted.

**Currency**
- USD (default), SYP, TRY, SAR, QAR, AED. Live rates from `open.er-api.com`, cached 6 hours,
  with a fallback table so a feed outage degrades gracefully.
- Switching currency repaints every price instantly (client-side market context) — no reload.

**Syrian pound**
- Public feeds publish the official peg, which is not the rate anyone trades at. Set
  `SYP_PER_USD` in the Vercel environment to pin the real rate; it always overrides the feed.

**Social**
- Instagram (`Lantana.perfume`) and WhatsApp (`+963 984 179 484`) in the announcement bar and
  in the footer. WhatsApp opens a direct chat via `wa.me`.

**Gallery**
- `components/product/Gallery.tsx` — staggered columns, hover zoom, lazy loading, captions,
  and a lightbox with arrow-key and Escape support.

## Nothing removed
Checkout, Stripe, MyFatoorah, COD, bank transfer, coupons, reviews, wishlist, admin and all
product data are untouched.
