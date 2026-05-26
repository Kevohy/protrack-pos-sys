import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { Role } from "@prisma/client";
import { z } from "zod";

// ── In-memory rate limiter (single-process VPS / Coolify) ────────────────────
const rl = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, limit = 15, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = rl.get(ip);
  if (!rec || now > rec.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}

// ── Sanitizers ────────────────────────────────────────────────────────────────
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

// ── Validation schema ─────────────────────────────────────────────────────────
const supplierSchema = z.object({
  companyName:   z.string().min(1, "Company name is required").max(200),
  contactPerson: z.string().min(1, "Contact person is required").max(200),
  phone:         z.string().regex(/^\d{9,12}$/, "Phone must be 9–12 digits"),
  email:         z.string().email("Invalid email format").optional().nullable(),
  category:      z.enum(["Goods", "Services", "Equipment"]),
  location:      z.string().max(200).optional().nullable(),
  notes:         z.string().max(1000).optional().nullable(),
});

// ── GET /api/[tenantSlug]/suppliers ───────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const suppliers = await prisma.supplier.findMany({
      where:   { tenantId: membership.tenantId },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      all:       suppliers.length,
      goods:     suppliers.filter((s) => s.category === "Goods").length,
      services:  suppliers.filter((s) => s.category === "Services").length,
      equipment: suppliers.filter((s) => s.category === "Equipment").length,
    };

    return NextResponse.json({ data: suppliers, counts });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ── POST /api/[tenantSlug]/suppliers ──────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests — please wait a moment." },
        { status: 429 }
      );
    }

    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);
    const body = await req.json();

    const sanitized = {
      companyName:   typeof body.companyName   === "string" ? titleCase(stripHtml(body.companyName))   : body.companyName,
      contactPerson: typeof body.contactPerson === "string" ? titleCase(stripHtml(body.contactPerson)) : body.contactPerson,
      phone:         typeof body.phone         === "string" ? stripHtml(body.phone).replace(/\D/g, "") : body.phone,
      email:         body.email    ? stripHtml(String(body.email)).toLowerCase() : null,
      category:      typeof body.category === "string" ? stripHtml(body.category) : body.category,
      location:      body.location ? capitalizeFirst(stripHtml(String(body.location))) : null,
      notes:         body.notes    ? stripHtml(String(body.notes)) : null,
    };

    const parsed = supplierSchema.safeParse(sanitized);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { companyName, contactPerson, phone, email, category, location, notes } = parsed.data;

    // Duplicate company name check (case-insensitive, tenant-scoped)
    const existingCompany = await prisma.supplier.findFirst({
      where: {
        tenantId:    membership.tenantId,
        companyName: { equals: companyName, mode: "insensitive" },
      },
    });
    if (existingCompany) {
      return NextResponse.json(
        { error: { companyName: ["Company name already exists"] } },
        { status: 409 }
      );
    }

    // Duplicate email check (case-insensitive, tenant-scoped)
    if (email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: {
          tenantId: membership.tenantId,
          email:    { equals: email, mode: "insensitive" },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: { email: ["This email is already registered"] } },
          { status: 409 }
        );
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        tenantId: membership.tenantId,
        companyName,
        contactPerson,
        phone,
        email:    email    ?? null,
        category,
        location: location ?? null,
        notes:    notes    ?? null,
      },
    });

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" },    { status: 403 });
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[suppliers POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
