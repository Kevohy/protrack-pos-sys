import { requireTenantRole } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Role } from "@prisma/client";

interface PageProps {
  params: { tenantSlug: string };
}

export default async function SalesPage({ params }: PageProps) {
  const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);
  const tenantId = membership.tenantId;

  const sales = await prisma.sale.findMany({
    where: { tenantId },
    include: {
      saleItems: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(sale.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {sale.saleItems.length} item(s)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{sale.paymentMethod}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    sale.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : sale.status === "REFUNDED"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {formatCurrency(sale.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No sales yet.</div>
        )}
      </div>
    </div>
  );
}
