import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { Role } from "@prisma/client";
import { z } from "zod";

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}
function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const updateSchema = z.object({
  type:        z.enum(["End User", "Distributor", "Company"]).optional(),
  name:        z.string().min(1).max(200).optional(),
  accountName: z.string().min(1).max(100).optional(),
  phone:       z.string().regex(/^\d{9,12}$/, "Phone must be 9–12 digits").optional(),
  email:       z.string().email().nullable().optional(),
  location:    z.string().max(200).nullable().optional(),
  status:      z.enum(["Active", "Inactive"]).optional(),
});

type RouteParams = { params: { tenantSlug: string; id: string } };

// ── GET /api/[tenantSlug]/customers/[id] ──────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });

    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: customer });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ── PUT /api/[tenantSlug]/customers/[id] ──────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // Sanitize incoming fields
    const raw: Record<string, unknown> = {};
    if (body.type        != null) raw.type        = stripHtml(String(body.type));
    if (body.name        != null) raw.name        = titleCase(stripHtml(String(body.name)));
    if (body.accountName != null) raw.accountName = stripHtml(String(body.accountName)).toUpperCase().replace(/\s/g, "");
    if (body.phone       != null) raw.phone       = stripHtml(String(body.phone)).replace(/\D/g, "");
    if (body.email       !== undefined) raw.email = body.email ? stripHtml(String(body.email)).toLowerCase() : null;
    if (body.location    !== undefined) raw.location = body.location ? capitalizeFirst(stripHtml(String(body.location))) : null;
    if (body.status      != null) raw.status = stripHtml(String(body.status));

    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Duplicate accountName check (excluding self)
    if (parsed.data.accountName && parsed.data.accountName !== existing.accountName) {
      const dup = await prisma.customer.findFirst({
        where: {
          tenantId:    membership.tenantId,
          accountName: { equals: parsed.data.accountName, mode: "insensitive" },
          NOT:         { id: params.id },
        },
      });
      if (dup) {
        return NextResponse.json(
          { error: { accountName: ["Account name already exists"] } },
          { status: 409 }
        );
      }
    }

    // Duplicate email check (excluding self)
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.customer.findFirst({
        where: {
          tenantId: membership.tenantId,
          email:    { equals: parsed.data.email, mode: "insensitive" },
          NOT:      { id: params.id },
        },
      });
      if (dup) {
        return NextResponse.json(
          { error: { email: ["This email is already registered"] } },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data:  parsed.data,
    });

    return NextResponse.json({ data: customer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[customers PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── DELETE /api/[tenantSlug]/customers/[id]  (soft delete) ───────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data:  { status: "Inactive" },
    });

    return NextResponse.json({ data: customer });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
