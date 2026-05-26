"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role, Tenant } from "@prisma/client";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tenant: Tenant;
  role: Role;
}

export function Sidebar({ tenant, role }: SidebarProps) {
  const pathname = usePathname();
  const base = `/${tenant.slug}`;

  const links = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard, minRole: "CASHIER" },
    { href: `${base}/sales`, label: "Sales", icon: ShoppingCart, minRole: "CASHIER" },
    { href: `${base}/products`, label: "Products", icon: Package, minRole: "CASHIER" },
    { href: `${base}/users`, label: "Users", icon: Users, minRole: "ADMIN" },
  ] as const;

  const roleOrder = { CASHIER: 1, MANAGER: 2, ADMIN: 3 };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Store</p>
        <h2 className="text-lg font-semibold truncate">{tenant.name}</h2>
        <span className="text-xs text-gray-400">{role}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          if (roleOrder[role] < roleOrder[link.minRole as Role]) return null;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
