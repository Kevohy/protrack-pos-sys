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

  let serialized: {
    id: string;
    tenantId: string;
    name: string;
    accountName: string;
    type: string;
    phone: string;
    email: string | null;
    location: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[] = [];

  try {
    const customers = await prisma.customer.findMany({
      where:   { tenantId: membership.tenantId },
      orderBy: { createdAt: "desc" },
    });

    serialized = customers.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[CustomersPage] DB query failed:", err);
    // Return empty list — the table may not exist yet pending a db push
  }

  return (
    <CustomersClient
      initialCustomers={serialized}
      tenantSlug={params.tenantSlug}
    />
  );
}
