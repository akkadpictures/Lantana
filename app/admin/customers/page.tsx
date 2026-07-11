import { Shell } from "@/components/admin/Shell";
import { Table, Card } from "@/components/admin/ui";
import { getCustomers } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const customers = await getCustomers();
  return (
    <Shell title="Customers">
      {customers.length === 0 ? (
        <Card><p className="font-body text-sm text-ink/50">Customers appear here once orders are placed.</p></Card>
      ) : (
        <Table head={["Name", "Email", "Phone", "Country", "Orders", "Last order"]}>
          {customers.map((c) => (
            <tr key={c.email} className="border-b hairline last:border-0">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-ink/70">{c.email}</td>
              <td className="px-4 py-3 text-ink/60" dir="ltr">{c.phone}</td>
              <td className="px-4 py-3">{c.country}</td>
              <td className="px-4 py-3">{c.orders}</td>
              <td className="px-4 py-3 text-ink/50">{new Date(c.lastOrder).toLocaleDateString("en-GB")}</td>
            </tr>
          ))}
        </Table>
      )}
    </Shell>
  );
}
