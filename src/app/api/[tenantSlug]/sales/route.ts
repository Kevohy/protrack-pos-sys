import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { z } from "zod";
import { Role } from "@prisma/client";

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  paymentMethod: z.enum(["CASH", "CARD", "MOBILE", "OTHER"]).default("CASH"),
  discount: z.number().min(0).default(0),
  note: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const sales = await prisma.sale.findMany({
      where: { tenantId: membership.tenantId },
      include: { saleItems: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ data: sales });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const body = await request.json();
    const parsed = saleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { items, paymentMethod, discount, note } = parsed.data;
    const tenantId = membership.tenantId;

    const products = await prisma.product.findMany({
      where: {
        tenantId,
        id: { in: items.map((i) => i.productId) },
        isActive: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 400 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const saleItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const total = unitPrice * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    const total = Math.max(0, subtotal - discount);

    const sale = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.sale.create({
        data: {
          tenantId,
          cashierId: membership.userId,
          paymentMethod,
          discount,
          total,
          note,
          status: "COMPLETED",
          saleItems: { create: saleItems },
        },
        include: { saleItems: true },
      });
    });

    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
