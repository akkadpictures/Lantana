"use client";

import { useState } from "react";
import { convertUSD } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import type { Currency, Product } from "@/types";

const CURRENCIES: Currency[] = ["USD", "SYP", "AED", "SAR", "QAR", "KWD"];

export function PricingClient({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function setPrice(id: string, cur: Currency, value: string) {
    setProducts((list) => list.map((p) => {
      if (p.id !== id) return p;
      if (cur === "USD") return { ...p, basePriceUSD: parseFloat(value) || 0 };
      const prices = { ...p.prices };
      if (value === "") delete prices[cur]; else prices[cur] = parseFloat(value) || 0;
      return { ...p, prices };
    }));
    setDirty((d) => new Set(d).add(id));
  }

  async function saveAll() {
    setSaving(true);
    const toSave = products.filter((p) => dirty.has(p.id));
    await Promise.all(toSave.map((p) => fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) })));
    setDirty(new Set());
    setSaving(false);
  }

  return (
    <>
      <div className="overflow-x-auto border hairline">
        <table className="w-full border-collapse font-body text-base2">
          <thead>
            <tr className="border-b hairline bg-ink/[0.03]">
              <th className="px-4 py-3 text-start text-micro uppercase tracking-wide2 text-ink/60">Product</th>
              {CURRENCIES.map((c) => <th key={c} className="px-3 py-3 text-start text-micro uppercase tracking-wide2 text-ink/60">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hairline last:border-0">
                <td className="px-4 py-2 font-medium">{p.name.en}<span className="block text-sm2 text-ink/40">{p.size}</span></td>
                {CURRENCIES.map((c) => {
                  const isUSD = c === "USD";
                  const explicit = isUSD ? p.basePriceUSD : p.prices[c];
                  const auto = convertUSD(p.basePriceUSD, c);
                  return (
                    <td key={c} className="px-3 py-2">
                      <input
                        type="number"
                        defaultValue={isUSD ? p.basePriceUSD : (explicit ?? "")}
                        placeholder={isUSD ? "" : String(auto)}
                        className="w-24 border border-ink/15 bg-transparent px-2 py-1 focus:border-olive focus:outline-none"
                        onChange={(e) => setPrice(p.id, c, e.target.value)}
                      />
                      {!isUSD && explicit === undefined && <span className="ms-1 text-micro text-ink/30">auto</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5">
        <Button onClick={saveAll} disabled={saving || dirty.size === 0}>{saving ? "Saving…" : `Save changes${dirty.size ? ` (${dirty.size})` : ""}`}</Button>
      </div>
    </>
  );
}
