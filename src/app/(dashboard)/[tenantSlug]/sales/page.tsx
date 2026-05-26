import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const sales = [
  { id: "SL-0041", customer: "James Mwangi", date: "2026-05-26", items: 3, total: 14500, discount: 0, method: "M-Pesa", status: "paid" },
  { id: "SL-0040", customer: "Tech Solutions Ltd", date: "2026-05-25", items: 7, total: 87200, discount: 4360, method: "Invoice", status: "partial" },
  { id: "SL-0039", customer: "Mary Wanjiku", date: "2026-05-25", items: 1, total: 3200, discount: 0, method: "Cash", status: "paid" },
  { id: "SL-0038", customer: "Nairobi Garage", date: "2026-05-20", items: 5, total: 52750, discount: 2638, method: "Invoice", status: "overdue" },
  { id: "SL-0037", customer: "Peter Kamau", date: "2026-05-19", items: 2, total: 8900, discount: 0, method: "Card", status: "paid" },
  { id: "SL-0036", customer: "SafariNet Ltd", date: "2026-05-18", items: 12, total: 134000, discount: 13400, method: "Invoice", status: "paid" },
  { id: "SL-0035", customer: "John Omondi", date: "2026-05-17", items: 1, total: 6500, discount: 0, method: "M-Pesa", status: "paid" },
  { id: "SL-0034", customer: "City Logistics", date: "2026-05-15", items: 8, total: 69200, discount: 3460, method: "Invoice", status: "partial" },
];

const statusVariant: Record<string, "green" | "amber" | "red"> = {
  paid: "green",
  partial: "amber",
  overdue: "red",
};

export default function SalesPage() {
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const paidCount = sales.filter((s) => s.status === "paid").length;
  const pendingCount = sales.filter((s) => s.status !== "paid").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sales.length} transactions this month</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> New Sale
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatKES(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-xl font-bold text-green-600 mt-1">{paidCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-500">Pending / Overdue</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Transactions</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Sale ID</th>
              <th className="px-6 py-3 text-left font-medium">Customer</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Items</th>
              <th className="px-6 py-3 text-right font-medium">Discount</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 text-left font-medium">Method</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono font-medium text-blue-600">{s.id}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900">{s.customer}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.date}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500 text-right">{s.items}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500 text-right">
                  {s.discount > 0 ? formatKES(s.discount) : "—"}
                </td>
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-right">{formatKES(s.total)}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.method}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={statusVariant[s.status]}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
