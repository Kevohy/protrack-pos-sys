import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const campaigns = [
  { id: "SMS-008", name: "May Payment Reminder", message: "Dear customer, your invoice INV-005x is due on 31 May. Kindly settle to avoid service interruption.", recipients: 34, sent: 34, failed: 0, date: "2026-05-20", status: "delivered" },
  { id: "SMS-007", name: "Subscription Renewal", message: "Your GPS tracking subscription expires on 1 June. Renew now to maintain uninterrupted tracking.", recipients: 87, sent: 85, failed: 2, date: "2026-05-18", status: "delivered" },
  { id: "SMS-006", name: "New Product Launch", message: "We have just received the new Teltonika FMC130 LTE trackers. Contact us for pricing.", recipients: 120, sent: 0, failed: 0, date: "2026-05-26", status: "scheduled" },
  { id: "SMS-005", name: "Overdue Notice", message: "This is a reminder that your account has an outstanding balance. Please pay immediately.", recipients: 12, sent: 12, failed: 0, date: "2026-05-15", status: "delivered" },
  { id: "SMS-004", name: "Service Maintenance", message: "Scheduled maintenance on 25 May from 00:00-04:00 EAT. GPS tracking may be intermittent.", recipients: 200, sent: 197, failed: 3, date: "2026-05-10", status: "delivered" },
];

const statusVariant: Record<string, "green" | "blue" | "amber" | "red"> = {
  delivered: "green",
  scheduled: "blue",
  partial: "amber",
  failed: "red",
};

export default function BulkSmsPage() {
  const totalRecipients = campaigns.reduce((s, c) => s + c.recipients, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bulk SMS</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send mass messages to customers and contacts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New Campaign</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: campaigns.length },
          { label: "Total Recipients", value: totalRecipients },
          { label: "Messages Sent", value: totalSent },
          { label: "Scheduled", value: campaigns.filter((c) => c.status === "scheduled").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">SMS Campaigns</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Campaign</th>
              <th className="px-6 py-3 text-left font-medium">Message Preview</th>
              <th className="px-6 py-3 text-right font-medium">Recipients</th>
              <th className="px-6 py-3 text-right font-medium">Sent</th>
              <th className="px-6 py-3 text-right font-medium">Failed</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.id}</p>
                </td>
                <td className="px-6 py-3.5 text-xs text-gray-500 max-w-xs truncate">{c.message}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900 text-right font-medium">{c.recipients}</td>
                <td className="px-6 py-3.5 text-sm text-green-600 text-right font-medium">{c.sent}</td>
                <td className="px-6 py-3.5 text-sm text-right font-medium">
                  <span className={c.failed > 0 ? "text-red-600" : "text-gray-400"}>{c.failed > 0 ? c.failed : "—"}</span>
                </td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{c.date}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={statusVariant[c.status]}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
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
