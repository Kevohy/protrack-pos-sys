import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const transactions = [
  { id: "AT-0021", network: "Safaricom", phone: "+254 712 345 678", recipient: "James Mwangi", amount: 500, date: "2026-05-26", ref: "SAF20260526001", status: "success" },
  { id: "AT-0020", network: "Airtel", phone: "+254 733 456 789", recipient: "Mary Wanjiku", amount: 200, date: "2026-05-25", ref: "AIR20260525007", status: "success" },
  { id: "AT-0019", network: "Safaricom", phone: "+254 722 987 654", recipient: "Tech Solutions", amount: 1000, date: "2026-05-24", ref: "SAF20260524003", status: "failed" },
  { id: "AT-0018", network: "Telkom", phone: "+254 777 334 455", recipient: "Brian Otieno", amount: 300, date: "2026-05-23", ref: "TEL20260523002", status: "success" },
  { id: "AT-0017", network: "Safaricom", phone: "+254 745 444 555", recipient: "Samuel Kipchoge", amount: 500, date: "2026-05-22", ref: "SAF20260522005", status: "success" },
  { id: "AT-0016", network: "Airtel", phone: "+254 756 555 666", recipient: "Diana Muthoni", amount: 250, date: "2026-05-21", ref: "AIR20260521009", status: "pending" },
];

const statusVariant: Record<string, "green" | "red" | "amber"> = {
  success: "green",
  failed: "red",
  pending: "amber",
};

const networkColor: Record<string, string> = {
  Safaricom: "text-green-600",
  Airtel: "text-red-600",
  Telkom: "text-blue-600",
};

export default function AirtimePage() {
  const totalSent = transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Airtime</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send airtime to customers and staff</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> Send Airtime</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Transactions", value: transactions.length },
          { label: "Successful", value: transactions.filter((t) => t.status === "success").length },
          { label: "Total Sent", value: formatKES(totalSent) },
          { label: "Failed", value: transactions.filter((t) => t.status === "failed").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Airtime History</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Ref ID</th>
              <th className="px-6 py-3 text-left font-medium">Network</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Recipient</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono text-blue-600">{t.id}</td>
                <td className={`px-6 py-3.5 text-sm font-medium ${networkColor[t.network] ?? "text-gray-900"}`}>{t.network}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{t.phone}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900">{t.recipient}</td>
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-900 text-right">{formatKES(t.amount)}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{t.date}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={statusVariant[t.status]}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
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
