"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ShippingRate } from "@/types";

export function ShippingClient({ initial }: { initial: ShippingRate[] }) {
  const [rates, setRates] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  function upd(country: string, patch: Partial<ShippingRate>) {
    setRates((list) => list.map((r) => (r.country === country ? { ...r, ...patch } : r)));
  }
  async function save(r: ShippingRate) {
    setSaving(r.country);
    await fetch("/api/admin/shipping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
    setSaving(null);
  }

  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full border-collapse font-body text-sm">
        <thead>
          <tr className="border-b hairline bg-ink/[0.03]">
            {["Region", "Label (EN)", "Price (USD)", "ETA min", "ETA max", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-start text-[11px] uppercase tracking-wide2 text-ink/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.country} className="border-b hairline last:border-0">
              <td className="px-4 py-3 font-medium">{r.country}</td>
              <td className="px-4 py-2"><input className="w-full border border-ink/15 bg-transparent px-2 py-1 focus:border-olive focus:outline-none" defaultValue={r.label.en} onChange={(e) => upd(r.country, { label: { ...r.label, en: e.target.value } })} /></td>
              <td className="px-4 py-2"><input type="number" className="w-20 border border-ink/15 bg-transparent px-2 py-1 focus:border-olive focus:outline-none" defaultValue={r.priceUSD} onChange={(e) => upd(r.country, { priceUSD: parseFloat(e.target.value) || 0 })} /></td>
              <td className="px-4 py-2"><input type="number" className="w-16 border border-ink/15 bg-transparent px-2 py-1 focus:border-olive focus:outline-none" defaultValue={r.etaDays[0]} onChange={(e) => upd(r.country, { etaDays: [parseInt(e.target.value) || 0, r.etaDays[1]] })} /></td>
              <td className="px-4 py-2"><input type="number" className="w-16 border border-ink/15 bg-transparent px-2 py-1 focus:border-olive focus:outline-none" defaultValue={r.etaDays[1]} onChange={(e) => upd(r.country, { etaDays: [r.etaDays[0], parseInt(e.target.value) || 0] })} /></td>
              <td className="px-4 py-2"><Button variant="outline" className="px-4 py-1.5 text-[11px]" disabled={saving === r.country} onClick={() => save(rates.find((x) => x.country === r.country)!)}>Save</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
