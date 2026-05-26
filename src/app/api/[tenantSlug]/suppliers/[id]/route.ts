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
  companyName:   z.string().min(1).max(200).optional(),
  contactPerson: z.string().min(1).max(200).optional(),
  phone:         z.string().regex(/^\d{9,12}$/, "Phone must be 9–12 digits").optional(),
  email:         z.string().email().nullable().optional(),
  category:      z.enum(["Goods", "Services", "Equipment"]).optional(),
  location:      z.string().max(200).nullable().optional(),
  notes:         z.string().max(1000).nullable().optional(),
  status:        z.enum(["Active", "Inactive"]).optional(),
});

type RouteParams = { params: { tenantSlug: string; id: string } };

// ── GET /api/[tenantSlug]/suppliers/[id] ──────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const supplier = await prisma.supplier.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });

    if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: supplier });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" },    { status: 403 });
    console.error("[suppliers GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── PUT /api/[tenantSlug]/suppliers/[id] ──────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const existing = await prisma.supplier.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    const raw: Record<string, unknown> = {};
    if (body.companyName   != null) raw.companyName   = titleCase(stripHtml(String(body.companyName)));
    if (body.contactPerson != null) raw.contactPerson = titleCase(stripHtml(String(body.contactPerson)));
    if (body.phone         != null) raw.phone         = stripHtml(String(body.phone)).replace(/\D/g, "");
    if (body.email         !== undefined) raw.email    = body.email ? stripHtml(String(body.email)).toLowerCase() : null;
    if (body.category      != null) raw.category      = stripHtml(String(body.category));
    if (body.location      !== undefined) raw.location = body.location ? capitalizeFirst(stripHtml(String(body.location))) : null;
    if (body.notes         !== undefined) raw.notes    = body.notes ? stripHtml(String(body.notes)) : null;
    if (body.status        != null) raw.status        = stripHtml(String(body.status));

    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Duplicate company name check (excluding self)
    if (parsed.data.companyName && parsed.data.companyName !== existing.companyName) {
      const dup = await prisma.supplier.findFirst({
        where: {
          tenantId:    membership.tenantId,
          companyName: { equals: parsed.data.companyName, mode: "insensitive" },
          NOT:         { id: params.id },
        },
      });
      if (dup) {
        return NextResponse.json(
          { error: { companyName: ["Company name already exists"] } },
          { status: 409 }
        );
      }
    }

    // Duplicate email check (excluding self)
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.supplier.findFirst({
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

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data:  parsed.data,
    });

    return NextResponse.json({ data: supplier });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" },    { status: 403 });
    console.error("[suppliers PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── DELETE /api/[tenantSlug]/suppliers/[id]  (soft delete) ───────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const existing = await prisma.supplier.findFirst({
      where: { id: params.id, tenantId: membership.tenantId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data:  { status: "Inactive" },
    });

    return NextResponse.json({ data: supplier });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" },    { status: 403 });
    console.error("[suppliers DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
