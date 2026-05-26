import { redirect } from "next/navigation";
import { getTenantMembership } from "@/lib/tenant";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { tenantSlug: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const membership = await getTenantMembership(params.tenantSlug);

  if (!membership) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar tenant={membership.tenant} role={membership.role} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
