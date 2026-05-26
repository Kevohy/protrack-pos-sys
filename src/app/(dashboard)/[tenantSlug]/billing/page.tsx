import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const invoices = [
  { id: "INV-0052", customer: "Tech Solutions Ltd", issued: "2026-05-01", due: "2026-05-31", amount: 87200, paid: 87200, balance: 0, status: "paid" },
  { id: "INV-0051", customer: "SafariNet Ltd", issued: "2026-05-01", due: "2026-05-31", amount: 134000, paid: 67000, balance: 67000, status: "partial" },
  { id: "INV-0050", customer: "Nairobi Garage", issued: "2026-04-15", due: "2026-05-15", amount: 52750, paid: 0, balance: 52750, status: "overdue" },
  { id: "INV-0049", customer: "City Logistics", issued: "2026-04-01", due: "2026-05-01", amount: 69200, paid: 53800, balance: 15400, status: "overdue" },
  { id: "INV-0048", customer: "James Mwangi", issued: "2026-05-10", due: "2026-05-24", amount: 14500, paid: 14500, balance: 0, status: "paid" },
  { id: "INV-0047", customer: "Peter Kamau", issued: "2026-05-15", due: "2026-06-14", amount: 8900, paid: 0, balance: 8900, status: "pending" },
];

const statusVariant: Record<string, "green" | "amber" | "red" | "blue"> = {
  paid: "green",
  partial: "amber",
  overdue: "red",
  pending: "blue",
};

export default function BillingPage() {
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">{invoices.length} invoices · {overdue} overdue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Billed", value: formatKES(totalBilled), color: "" },
          { label: "Collected", value: formatKES(totalBilled - totalOutstanding), color: "text-green-600" },
          { label: "Outstanding", value: formatKES(totalOutstanding), color: "text-amber-600" },
          { label: "Overdue", value: overdue, color: "text-red-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color || "text-gray-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Invoices</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Invoice #</th>
              <th className="px-6 py-3 text-left font-medium">Customer</th>
              <th className="px-6 py-3 text-left font-medium">Issued</th>
              <th className="px-6 py-3 text-left font-medium">Due</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-6 py-3 text-right font-medium">Paid</th>
              <th className="px-6 py-3 text-right font-medium">Balance</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono font-medium text-blue-600">{inv.id}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900">{inv.customer}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{inv.issued}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{inv.due}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">{formatKES(inv.amount)}</td>
                <td className="px-6 py-3.5 text-sm text-green-600 font-medium text-right">{formatKES(inv.paid)}</td>
                <td className={`px-6 py-3.5 text-sm font-medium text-right ${inv.balance > 0 ? "text-red-600" : "text-gray-400"}`}>
                  {inv.balance > 0 ? formatKES(inv.balance) : "—"}
                </td>
                <td className="px-6 py-3.5">
                  <Badge variant={statusVariant[inv.status]}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right space-x-3">
                  <button className="text-xs text-blue-600 hover:underline font-medium">View</button>
                  <button className="text-xs text-gray-500 hover:underline font-medium">Record Payment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
