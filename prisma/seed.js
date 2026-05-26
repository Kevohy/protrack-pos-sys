const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-store" },
    update: {},
    create: {
      name: "Demo Store",
      slug: "demo-store",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash,
    },
  });

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: admin.id } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: admin.id,
      role: "ADMIN",
    },
  });

  const category = await prisma.category.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "General" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "General",
    },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        tenantId: tenant.id,
        categoryId: category.id,
        name: "Coffee",
        sku: "COFFEE-001",
        price: 3.5,
        cost: 1.0,
        stock: 100,
      },
      {
        tenantId: tenant.id,
        categoryId: category.id,
        name: "Tea",
        sku: "TEA-001",
        price: 2.5,
        cost: 0.5,
        stock: 100,
      },
    ],
  });

  console.log("Seed complete. Tenant:", tenant.slug, "| Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
