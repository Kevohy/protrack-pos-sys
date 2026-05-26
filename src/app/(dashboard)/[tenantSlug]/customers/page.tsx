import { getTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CustomersClient } from "./customers-client";

interface PageProps {
  params: { tenantSlug: string };
}

export default async function CustomersPage({ params }: PageProps) {
  const membership = await getTenantMembership(params.tenantSlug);
  if (!membership) redirect("/login");

  const customers = await prisma.customer.findMany({
    where:   { tenantId: membership.tenantId },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Dates → ISO strings for client component
  const serialized = customers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <CustomersClient
      initialCustomers={serialized}
      tenantSlug={params.tenantSlug}
    />
  );
}
