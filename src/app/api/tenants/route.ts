import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Tenant slug already exists" }, { status: 409 });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: parsed.data.name,
      slug,
      users: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json({ data: tenant }, { status: 201 });
}
