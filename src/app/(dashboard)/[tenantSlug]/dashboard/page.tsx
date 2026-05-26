import { requireTenantRole } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Role } from "@prisma/client";

interface PageProps {
  params: { tenantSlug: string };
}

export default async function DashboardPage({ params }: PageProps) {
  const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);
  const tenantId = membership.tenantId;

  const [totalSales, totalProducts, recentSales] = await Promise.all([
    prisma.sale.aggregate({
      where: { tenantId, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.product.count({ where: { tenantId, isActive: true } }),
    prisma.sale.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { saleItems: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalSales._sum.total ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{totalSales._count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Active Products</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
        {recentSales.length === 0 ? (
          <p className="text-gray-500 text-sm">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{sale.paymentMethod}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
