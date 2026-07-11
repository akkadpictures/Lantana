"use client";

import { useState } from "react";
import { Table, Badge, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Input";
import type { Coupon } from "@/types";

export function CouponsClient({ initial }: { initial: Coupon[] }) {
  const [coupons, setCoupons] = useState(initial);
  const [draft, setDraft] = useState<Coupon>({ code: "", type: "percent", value: 10, active: true, minSubtotalUSD: 0 });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!draft.code.trim()) return;
    setSaving(true);
    const payload = { ...draft, code: draft.code.trim().toUpperCase() };
    const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setCoupons((list) => { const i = list.findIndex((c) => c.code === payload.code); return i >= 0 ? list.map((c) => (c.code === payload.code ? payload : c)) : [...list, payload]; });
      setDraft({ code: "", type: "percent", value: 10, active: true, minSubtotalUSD: 0 });
    }
  }
  async function remove(code: string) {
    await fetch(`/api/admin/coupons?code=${code}`, { method: "DELETE" });
    setCoupons((list) => list.filter((c) => c.code !== code));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {coupons.length === 0 ? <Card><p className="font-body text-sm text-ink/50">No coupons yet.</p></Card> : (
          <Table head={["Code", "Type", "Value", "Min (USD)", "Status", ""]}>
            {coupons.map((c) => (
              <tr key={c.code} className="border-b hairline last:border-0">
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3 text-ink/60">{c.type}</td>
                <td className="px-4 py-3">{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-4 py-3">${c.minSubtotalUSD}</td>
                <td className="px-4 py-3"><Badge tone={c.active ? "green" : "grey"}>{c.active ? "active" : "off"}</Badge></td>
                <td className="px-4 py-3"><button className="text-red-800 underline" onClick={() => remove(c.code)}>Delete</button></td>
              </tr>
            ))}
          </Table>
        )}
      </div>
      <Card>
        <h2 className="mb-4 font-display text-xl">Add / edit coupon</h2>
        <div className="space-y-3">
          <div><Label>Code</Label><Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></div>
          <div><Label>Type</Label><Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}><option value="percent">Percent</option><option value="fixed">Fixed (USD)</option></Select></div>
          <div><Label>Value</Label><Input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label>Minimum subtotal (USD)</Label><Input type="number" value={draft.minSubtotalUSD} onChange={(e) => setDraft({ ...draft, minSubtotalUSD: parseFloat(e.target.value) || 0 })} /></div>
          <label className="flex items-center gap-2 font-body text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active</label>
          <Button variant="olive" onClick={save} disabled={saving || !draft.code.trim()}>{saving ? "Saving…" : "Save coupon"}</Button>
        </div>
      </Card>
    </div>
  );
}
