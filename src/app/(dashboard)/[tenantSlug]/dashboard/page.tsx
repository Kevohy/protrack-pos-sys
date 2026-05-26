import { TrendingUp, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils";

const stats = [
  {
    label: "Total Revenue",
    value: formatKES(2847500),
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Sales This Month",
    value: "184",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Active Customers",
    value: "342",
    change: "+3.1%",
    up: true,
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Low Stock Items",
    value: "17",
    change: "+4 items",
    up: false,
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const recentSales = [
  { id: "SL-0041", customer: "James Mwangi", items: 3, total: 14500, method: "M-Pesa", status: "paid" },
  { id: "SL-0040", customer: "Tech Solutions Ltd", items: 7, total: 87200, method: "Invoice", status: "partial" },
  { id: "SL-0039", customer: "Mary Wanjiku", items: 1, total: 3200, method: "Cash", status: "paid" },
  { id: "SL-0038", customer: "Nairobi Garage", items: 5, total: 52750, method: "Invoice", status: "overdue" },
  { id: "SL-0037", customer: "Peter Kamau", items: 2, total: 8900, method: "Card", status: "paid" },
];

const statusVariant: Record<string, "green" | "amber" | "red"> = {
  paid: "green",
  partial: "amber",
  overdue: "red",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{s.label}</p>
              <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{s.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {s.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${s.up ? "text-green-600" : "text-red-600"}`}>
                {s.change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Sales</h2>
          <a href="./sales" className="text-xs text-blue-600 hover:underline font-medium">
            View all →
          </a>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="px-6 py-3 text-left font-medium">Sale ID</th>
              <th className="px-6 py-3 text-left font-medium">Customer</th>
              <th className="px-6 py-3 text-left font-medium">Items</th>
              <th className="px-6 py-3 text-left font-medium">Total</th>
              <th className="px-6 py-3 text-left font-medium">Method</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentSales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono font-medium text-blue-600">{s.id}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900">{s.customer}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{s.items}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{formatKES(s.total)}</td>
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
