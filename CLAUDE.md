# POS SaaS Project

## Stack
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL on Hetzner
- ORM: Prisma
- Auth: NextAuth.js
- Styling: Tailwind CSS
- Deployment: GitHub Actions → Hetzner VPS

## Architecture
- Multi-tenant SaaS
- Tenant isolation via PostgreSQL Row-Level Security (RLS)
- Each tenant has: products, sales, users, roles

## Business Rules
- Each tenant is a business (shop/store)
- Tenants cannot see each other's data
- Roles per tenant: Admin, Manager, Cashier

## Conventions
- TypeScript everywhere
- REST API under /api/
- All DB queries go through Prisma
- Never expose tenant data across tenants
