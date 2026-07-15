import { Shell } from "@/components/admin/Shell";
import { Card } from "@/components/admin/ui";
import { hasDB } from "@/lib/supabase";
import { hasStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function Row({ label, ok, note }: { label: string; ok: boolean; note: string }) {
  return (
    <div className="flex items-center justify-between border-b hairline py-3 last:border-0">
      <div>
        <p className="font-body text-sm text-ink">{label}</p>
        <p className="font-body text-xs text-ink/50">{note}</p>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wide2 ${ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
        {ok ? "Connected" : "Not set"}
      </span>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <Shell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl">Integrations</h2>
          <Row label="Supabase (database)" ok={hasDB} note="NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY" />
          <Row label="Stripe (cards, Apple/Google Pay)" ok={hasStripe} note="STRIPE_SECRET_KEY + webhook secret" />
          <Row label="MyFatoorah (GCC)" ok={Boolean(process.env.MYFATOORAH_API_KEY)} note="MYFATOORAH_API_KEY" />
          <p className="mt-4 font-body text-xs text-ink/50">
            When an integration shows “Not set”, the site still runs: the database falls back to the bundled
            catalog, and payment methods that require missing keys are hidden or return a clear error at checkout.
          </p>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-xl">Maison</h2>
          <dl className="space-y-3 font-body text-sm">
            <div className="flex justify-between"><dt className="text-ink/50">Brand</dt><dd>LANTANA — لانتانا</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Launch</dt><dd>Damascus, Syria</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Production</dt><dd>Dubai, UAE</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Base currency</dt><dd>USD</dd></div>
            <div className="flex justify-between"><dt className="text-ink/50">Languages</dt><dd>English · العربية</dd></div>
          </dl>
          <p className="mt-4 font-body text-xs text-ink/50">
            Brand palette, typography and copy are configured in code (Tailwind theme + dictionaries).
            Products, pricing, collections, shipping, coupons, reviews and the journal are all editable here.
          </p>
        </Card>
      </div>
    </Shell>
  );
}
