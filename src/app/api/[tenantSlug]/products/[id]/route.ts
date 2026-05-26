import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { z } from "zod";
import { Role } from "@prisma/client";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

async function getProduct(tenantId: string, id: string) {
  return prisma.product.findFirst({ where: { id, tenantId } });
}

export async function GET(
  _request: Request,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);
    const product = await getProduct(membership.tenantId, params.id);

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.MANAGER);
    const existing = await getProduct(membership.tenantId, params.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ data: product });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { tenantSlug: string; id: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.ADMIN);
    const existing = await getProduct(membership.tenantId, params.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
