import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { z } from "zod";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const inviteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).default(Role.CASHIER),
});

export async function GET(
  _request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.MANAGER);

    const users = await prisma.tenantUser.findMany({
      where: { tenantId: membership.tenantId },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: users });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[users GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.ADMIN);

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash },
    });

    const existing = await prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId: membership.tenantId, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "User already in tenant" }, { status: 409 });
    }

    const tenantUser = await prisma.tenantUser.create({
      data: { tenantId: membership.tenantId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ data: tenantUser }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[users POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
