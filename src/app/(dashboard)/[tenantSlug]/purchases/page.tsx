import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const purchases = [
  { id: "PO-0018", supplier: "Teltonika East Africa", date: "2026-05-24", items: 10, total: 245000, received: 245000, status: "received" },
  { id: "PO-0017", supplier: "Concox Kenya Ltd", date: "2026-05-20", items: 5, total: 89000, received: 44500, status: "partial" },
  { id: "PO-0016", supplier: "AutoElec Supplies", date: "2026-05-18", items: 30, total: 34200, received: 34200, status: "received" },
  { id: "PO-0015", supplier: "Safaricom PLC", date: "2026-05-15", items: 200, total: 12500, received: 0, status: "pending" },
  { id: "PO-0014", supplier: "Teltonika East Africa", date: "2026-05-10", items: 20, total: 198000, received: 198000, status: "received" },
  { id: "PO-0013", supplier: "Concox Kenya Ltd", date: "2026-05-05", items: 8, total: 112000, received: 0, status: "cancelled" },
];

const statusVariant: Record<string, "green" | "amber" | "blue" | "red"> = {
  received: "green",
  partial: "amber",
  pending: "blue",
  cancelled: "red",
};

export default function PurchasesPage() {
  const totalSpend = purchases.filter((p) => p.status !== "cancelled").reduce((s, p) => s + p.total, 0);
  const pending = purchases.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-500 mt-0.5">{purchases.length} purchase orders · {pending} pending delivery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New PO</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: purchases.length },
          { label: "Total Spend", value: formatKES(totalSpend) },
          { label: "Pending Delivery", value: pending },
          { label: "Partial Received", value: purchases.filter((p) => p.status === "partial").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Purchase Orders</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">PO Number</th>
              <th className="px-6 py-3 text-left font-medium">Supplier</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Items</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 text-right font-medium">Received</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {purchases.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono font-medium text-blue-600">{p.id}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900">{p.supplier}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{p.date}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500 text-right">{p.items}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">{formatKES(p.total)}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500 text-right">{formatKES(p.received)}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={statusVariant[p.status]}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button className="text-xs text-blue-600 hover:underline font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
