import Link from "next/link";
import Image from "next/image";
import { Price } from "./Price";
import { t } from "@/lib/utils";
import type { Currency, Locale, Product } from "@/types";

export function ProductCard({ product, locale, currency, priority = false }: { product: Product; locale: Locale; currency: Currency; priority?: boolean }) {
  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <div className="frame-zoom relative aspect-square bg-ivory-soft">
        <Image
          src={product.image}
          alt={t(product.name, locale)}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-display text-lg font-light tracking-wide2 text-ink">{t(product.name, locale)}</h3>
        <p className="mt-0.5 font-body text-xs text-ink/50">{t(product.accord, locale)} · {product.size}</p>
        <p className="mt-1.5 font-body text-sm text-olive-deep">
          <Price product={product} currency={currency} locale={locale} />
        </p>
      </div>
    </Link>
  );
}
