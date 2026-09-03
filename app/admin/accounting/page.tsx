import { Shell } from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default function AdminAccounting() {
  return (
    <Shell title="Accounting">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#F6F3EA] shadow-[0_18px_40px_-28px_rgba(42,44,34,0.45)]">
        <iframe
          src="/admin/accounting-app.html?embed=1"
          title="Accounting"
          className="block h-[calc(100vh-12rem)] min-h-[640px] w-full border-0"
        />
      </div>
      <p className="mt-3 font-body text-xs text-ink/45">
        Sales, inventory, purchases, expenses, cash and P&amp;L. Data is stored in this browser — download a backup weekly from Settings inside the panel.
      </p>
    </Shell>
  );
}
