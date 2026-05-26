import { getTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SuppliersClient } from "./suppliers-client";

interface PageProps {
  params: { tenantSlug: string };
}

export default async function SuppliersPage({ params }: PageProps) {
  const membership = await getTenantMembership(params.tenantSlug);
  if (!membership) redirect("/login");

  let serialized: {
    id: string;
    tenantId: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string | null;
    category: string;
    location: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[] = [];

  try {
    const suppliers = await prisma.supplier.findMany({
      where:   { tenantId: membership.tenantId },
      orderBy: { createdAt: "desc" },
    });

    serialized = suppliers.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("[SuppliersPage] DB query failed:", err);
  }

  return (
    <SuppliersClient
      initialSuppliers={serialized}
      tenantSlug={params.tenantSlug}
    />
  );
}
