import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { z } from "zod";
import { Role } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(
  _request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const products = await prisma.product.findMany({
      where: { tenantId: membership.tenantId },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.MANAGER);

    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        tenantId: membership.tenantId,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
