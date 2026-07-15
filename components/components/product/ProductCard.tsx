import Link from "next/link";
import Image from "next/image";
import { Price } from "./Price";
import { t } from "@/lib/utils";
import type { Currency, Locale, Product } from "@/types";

export function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  currency?: Currency;
  priority?: boolean;
}) {
  const soldOut = product.inventory <= 0;

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <div className="frame-zoom relative aspect-[4/5] overflow-hidden bg-ivory-soft">
        <Image
          src={product.image}
          alt={t(product.name, locale)}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        {/* The veil lifts on hover — the bottle steps forward, nothing shouts. */}
        <div className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-700 ease-luxe group-hover:bg-ink/[0.04]" />
        {soldOut && (
          <span className="absolute start-4 top-4 bg-ivory/95 px-3 py-1.5 font-body text-micro uppercase tracking-luxe text-ink/70">
            —
          </span>
        )}
      </div>

      <div className="pt-6 text-center">
        <h3 className="t-h4 text-ink transition-colors duration-500 group-hover:text-olive-deep">
          {t(product.name, locale)}
        </h3>
        <p className="t-small mt-2">
          {t(product.accord, locale)} · {product.size}
        </p>
        <p className="t-price mt-3">
          <Price product={product} />
        </p>
      </div>
    </Link>
  );
}
