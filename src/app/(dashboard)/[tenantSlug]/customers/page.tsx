import { Plus, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const customers = [
  { id: 1, name: "James Mwangi", phone: "+254 712 345 678", email: "james@email.com", type: "Individual", balance: 12500, status: "active" },
  { id: 2, name: "Tech Solutions Ltd", phone: "+254 722 987 654", email: "info@techsol.co.ke", type: "Business", balance: 87500, status: "active" },
  { id: 3, name: "Mary Wanjiku", phone: "+254 733 456 789", email: "mary@email.com", type: "Individual", balance: -3200, status: "overdue" },
  { id: 4, name: "Nairobi Garage", phone: "+254 700 112 233", email: "nbi.garage@mail.com", type: "Business", balance: 52750, status: "active" },
  { id: 5, name: "Peter Kamau", phone: "+254 711 223 344", email: "peter@email.com", type: "Individual", balance: 0, status: "active" },
  { id: 6, name: "SafariNet Ltd", phone: "+254 729 334 455", email: "ops@safarinet.co.ke", type: "Business", balance: 134000, status: "active" },
  { id: 7, name: "City Logistics", phone: "+254 755 667 788", email: "admin@citylog.co.ke", type: "Business", balance: -15400, status: "overdue" },
  { id: 8, name: "Grace Njeri", phone: "+254 720 778 899", email: "grace.njeri@email.com", type: "Individual", balance: 4500, status: "active" },
];

export default function CustomersPage() {
  const totalBalance = customers.reduce((s, c) => s + c.balance, 0);
  const overdue = customers.filter((c) => c.balance < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} customers · {overdue} with overdue balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length, color: "" },
          { label: "Businesses", value: customers.filter((c) => c.type === "Business").length, color: "" },
          { label: "Total Outstanding", value: formatKES(totalBalance), color: "text-blue-600" },
          { label: "Overdue Accounts", value: overdue, color: "text-red-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color || "text-gray-900"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Customers</h2>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Type</th>
              <th className="px-6 py-3 text-right font-medium">Balance (KES)</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{c.phone}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{c.email}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={c.type === "Business" ? "blue" : "gray"}>{c.type}</Badge>
                </td>
                <td className={`px-6 py-3.5 text-sm font-medium text-right ${c.balance < 0 ? "text-red-600" : "text-gray-900"}`}>
                  {formatKES(c.balance)}
                </td>
                <td className="px-6 py-3.5">
                  <Badge variant={c.status === "active" ? "green" : "red"}>
                    {c.status === "active" ? "Active" : "Overdue"}
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
