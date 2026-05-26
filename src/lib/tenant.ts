import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getTenantMembership(tenantSlug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const membership = await prisma.tenantUser.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      tenant: { slug: tenantSlug },
    },
    include: { tenant: true },
  });

  return membership;
}

export async function requireTenantRole(tenantSlug: string, minRole: Role) {
  const membership = await getTenantMembership(tenantSlug);
  if (!membership) throw new Error("UNAUTHORIZED");

  const roleHierarchy: Record<Role, number> = {
    CASHIER: 1,
    MANAGER: 2,
    ADMIN: 3,
  };

  if (roleHierarchy[membership.role] < roleHierarchy[minRole]) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}
