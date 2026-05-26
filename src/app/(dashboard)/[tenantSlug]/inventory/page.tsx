import { Plus, Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";

const products = [
  { id: 1, name: "GPS Tracker VT600", sku: "GPS-VT600", category: "GPS Devices", stock: 24, cost: 3500, price: 6500, status: "active" },
  { id: 2, name: "OBD2 Tracker", sku: "GPS-OBD2", category: "GPS Devices", stock: 8, cost: 2800, price: 5200, status: "active" },
  { id: 3, name: "Hardwired Tracker Pro", sku: "GPS-HWP01", category: "GPS Devices", stock: 3, cost: 4500, price: 8900, status: "low" },
  { id: 4, name: "SIM Card (Safaricom)", sku: "SIM-SAF01", category: "SIM Cards", stock: 150, cost: 50, price: 150, status: "active" },
  { id: 5, name: "Power Harness Cable", sku: "ACC-PHC01", category: "Accessories", stock: 0, cost: 350, price: 750, status: "out" },
  { id: 6, name: "Relay Module 12V", sku: "ACC-RLY12", category: "Accessories", stock: 45, cost: 280, price: 600, status: "active" },
  { id: 7, name: "Magnetic Mount", sku: "ACC-MAG01", category: "Accessories", stock: 62, cost: 180, price: 400, status: "active" },
  { id: 8, name: "Asset Tracker Mini", sku: "GPS-ATM01", category: "GPS Devices", stock: 5, cost: 1900, price: 3800, status: "low" },
];

const stockVariant: Record<string, "green" | "amber" | "red" | "gray"> = {
  active: "green",
  low: "amber",
  out: "red",
  inactive: "gray",
};

const stockLabel: Record<string, string> = {
  active: "In Stock",
  low: "Low Stock",
  out: "Out of Stock",
  inactive: "Inactive",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products · 3 low or out of stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length },
          { label: "In Stock", value: products.filter((p) => p.status === "active").length },
          { label: "Low Stock", value: products.filter((p) => p.status === "low").length },
          { label: "Out of Stock", value: products.filter((p) => p.status === "out").length },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">All Products</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </div>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Product</th>
              <th className="px-6 py-3 text-left font-medium">SKU</th>
              <th className="px-6 py-3 text-left font-medium">Category</th>
              <th className="px-6 py-3 text-right font-medium">Stock</th>
              <th className="px-6 py-3 text-right font-medium">Cost Price</th>
              <th className="px-6 py-3 text-right font-medium">Selling Price</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-3.5 text-xs font-mono text-gray-500">{p.sku}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500">{p.category}</td>
                <td className="px-6 py-3.5 text-sm text-gray-900 text-right font-medium">{p.stock}</td>
                <td className="px-6 py-3.5 text-sm text-gray-500 text-right">{formatKES(p.cost)}</td>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">{formatKES(p.price)}</td>
                <td className="px-6 py-3.5">
                  <Badge variant={stockVariant[p.status]}>{stockLabel[p.status]}</Badge>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
