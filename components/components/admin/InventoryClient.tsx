"use client";

import { useState } from "react";
import { Table, Badge } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types";

export function InventoryClient({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(p: Product, inventory: number) {
    setSaving(p.id);
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, inventory } : x)));
    await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, inventory }) });
    setSaving(null);
  }

  return (
    <Table head={["Product", "Size", "Status", "In stock", ""]}>
      {products.map((p) => (
        <tr key={p.id} className="border-b hairline last:border-0">
          <td className="px-4 py-3 font-medium">{p.name.en}</td>
          <td className="px-4 py-3 text-ink/60">{p.size}</td>
          <td className="px-4 py-3"><Badge tone={p.status === "active" ? "green" : "grey"}>{p.status}</Badge></td>
          <td className="px-4 py-3">
            <input
              type="number" min={0} defaultValue={p.inventory}
              className="w-24 border border-ink/20 bg-transparent px-2 py-1 font-body text-base2 focus:border-olive focus:outline-none"
              onBlur={(e) => { const v = Math.max(0, parseInt(e.target.value) || 0); if (v !== p.inventory) save(p, v); }}
            />
            {p.inventory <= 10 && <span className="ms-2 text-sm2 text-red-800">low</span>}
          </td>
          <td className="px-4 py-3">
            <Button variant="outline" className="px-4 py-1.5 text-micro" disabled={saving === p.id}
              onClick={() => save(p, p.inventory + 50)}>+50</Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
