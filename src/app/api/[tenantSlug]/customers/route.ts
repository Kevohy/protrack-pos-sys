import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/tenant";
import { Role } from "@prisma/client";
import { z } from "zod";

// ── Simple in-memory rate limiter (VPS deployment, single process) ────────────
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
const customerSchema = z.object({
  type:        z.enum(["End User", "Distributor", "Company"]),
  name:        z.string().min(1, "Full name is required").max(200),
  accountName: z.string().min(1, "Account name is required").max(100),
  phone:       z.string().regex(/^\d{9,12}$/, "Phone must be 9–12 digits"),
  email:       z.string().email("Invalid email format").optional().nullable(),
  location:    z.string().max(200).optional().nullable(),
});

// ── GET /api/[tenantSlug]/customers ───────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const customers = await prisma.customer.findMany({
      where: { tenantId: membership.tenantId },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      all:          customers.length,
      endUser:      customers.filter((c) => c.type === "End User").length,
      distributor:  customers.filter((c) => c.type === "Distributor").length,
      company:      customers.filter((c) => c.type === "Company").length,
    };

    return NextResponse.json({ data: customers, counts });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ── POST /api/[tenantSlug]/customers ──────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { tenantSlug: string } }
) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests — please wait a moment." }, { status: 429 });
    }

    const membership = await requireTenantRole(params.tenantSlug, Role.CASHIER);

    const body = await req.json();

    // Server-side sanitization
    const sanitized = {
      type:        typeof body.type === "string" ? stripHtml(body.type) : body.type,
      name:        typeof body.name === "string" ? titleCase(stripHtml(body.name)) : body.name,
      accountName: typeof body.accountName === "string"
                     ? stripHtml(body.accountName).toUpperCase().replace(/\s/g, "")
                     : body.accountName,
      phone:       typeof body.phone === "string"
                     ? stripHtml(body.phone).replace(/\D/g, "")
                     : body.phone,
      email:       body.email ? stripHtml(String(body.email)).toLowerCase() : null,
      location:    body.location ? capitalizeFirst(stripHtml(String(body.location))) : null,
    };

    const parsed = customerSchema.safeParse(sanitized);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, name, accountName, phone, email, location } = parsed.data;

    // Duplicate account name check (case-insensitive, tenant-scoped)
    const existingAccount = await prisma.customer.findFirst({
      where: {
        tenantId: membership.tenantId,
        accountName: { equals: accountName, mode: "insensitive" },
      },
    });
    if (existingAccount) {
      return NextResponse.json(
        { error: { accountName: ["Account name already exists"] } },
        { status: 409 }
      );
    }

    // Duplicate email check (case-insensitive, tenant-scoped)
    if (email) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          tenantId: membership.tenantId,
          email: { equals: email, mode: "insensitive" },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: { email: ["This email is already registered"] } },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId: membership.tenantId,
        type,
        name,
        accountName,
        phone,
        email:    email    ?? null,
        location: location ?? null,
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "FORBIDDEN")    return NextResponse.json({ error: "Forbidden" },    { status: 403 });
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("[customers POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
