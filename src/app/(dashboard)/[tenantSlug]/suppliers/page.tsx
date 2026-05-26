import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const suppliers = [
  { id: 1, company: "Teltonika East Africa", contact: "David Ochieng", phone: "+254 700 123 456", category: "GPS Devices", outstanding: 245000, status: "active" },
  { id: 2, company: "Concox Kenya Ltd", contact: "Sarah Mutua", phone: "+254 722 234 567", category: "GPS Devices", outstanding: 89000, status: "active" },
  { id: 3, company: "Safaricom PLC", contact: "Account Manager", phone: "+254 722 000 000", category: "SIM Cards", outstanding: 12500, status: "active" },
  { id: 4, company: "Airtel Networks", contact: "Business Desk", phone: "+254 733 000 100", category: "SIM Cards", outstanding: 0, status: "active" },
  { id: 5, company: "AutoElec Supplies", contact: "John Kariuki", phone: "+254 715 345 678", category: "Accessories", outstanding: 34200, status: "active" },
  { id: 6, company: "Conel Electronics", contact: "Faith Wambua", phone: "+254 726 456 789", category: "Accessories", outstanding: 0, status: "inactive" },
];

export default function SuppliersPage() {
  const totalOutstanding = suppliers.reduce((s, sup) => s + sup.outstanding, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{suppliers.length} suppliers on record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Supplier</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Suppliers", value: suppliers.length },
          { label: "Active", value: suppliers.filter((s) => s.status === "active").length },
          { label: "Total Outstanding", value: formatKES(totalOutstanding) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Suppliers</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Company</th>
              <th className="px-6 py-3 text-left font-medium">Contact Person</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Category</th>
              <th className="px-6 py-3 text-right font-medium">Outstanding</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{s.company}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.contact}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.phone}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.category}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-right text-gray-900">{formatKES(s.outstanding)}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={s.status === "active" ? "green" : "gray"}>
                    {s.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-right space-x-3">
                  <button className="text-xs text-blue-600 hover:underline font-medium">View</button>
                  <button className="text-xs text-gray-500 hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
