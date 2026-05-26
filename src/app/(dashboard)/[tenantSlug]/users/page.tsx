import { requireTenantRole } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface PageProps {
  params: { tenantSlug: string };
}

export default async function UsersPage({ params }: PageProps) {
  const membership = await requireTenantRole(params.tenantSlug, Role.ADMIN);
  const tenantId = membership.tenantId;

  const members = await prisma.tenantUser.findMany({
    where: { tenantId },
    include: { user: { select: { name: true, email: true, createdAt: true } } },
    orderBy: { createdAt: "asc" },
  });

  const roleBadgeClass: Record<Role, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    MANAGER: "bg-blue-100 text-blue-800",
    CASHIER: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.user.name ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${roleBadgeClass[m.role]}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    m.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">No users yet.</div>
        )}
      </div>
    </div>
  );
}
