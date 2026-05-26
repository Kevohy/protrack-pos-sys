"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Building2, Wrench, Package,
  ShoppingCart, ShoppingBag, Receipt, Phone, MessageSquare,
  FileText, MapPin, Settings, ChevronDown, ChevronRight, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role, Tenant } from "@prisma/client";

interface SidebarProps {
  tenant: Tenant;
  role: Role;
}

function NavItem({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors border-l-[3px]",
        active
          ? "border-blue-500 bg-blue-950/40 text-white font-medium"
          : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 select-none">
      {children}
    </p>
  );
}

export function Sidebar({ tenant, role }: SidebarProps) {
  const pathname = usePathname();
  const base = `/${tenant.slug}`;

  const crmPaths = ["/customers", "/suppliers", "/technicians"];
  const [crmOpen, setCrmOpen] = useState(() =>
    crmPaths.some((r) => pathname.includes(r))
  );

  return (
    <aside
      className="w-64 flex flex-col h-screen flex-shrink-0 overflow-y-auto"
      style={{ backgroundColor: "#0d1b2a" }}
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: "#2563eb" }}
          >
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {tenant.name}
            </p>
            <p className="text-gray-500 text-[11px] mt-0.5">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {/* MAIN */}
        <SectionLabel>Main</SectionLabel>
        <NavItem href={`${base}/dashboard`} icon={LayoutDashboard} label="Dashboard" pathname={pathname} />

        {/* CRM */}
        <SectionLabel>CRM</SectionLabel>
        <button
          onClick={() => setCrmOpen((o) => !o)}
          className={cn(
            "w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors border-l-[3px]",
            crmPaths.some((r) => pathname.includes(r))
              ? "border-blue-500 bg-blue-950/40 text-white"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <span className="flex items-center gap-3">
            <Users className="h-4 w-4 flex-shrink-0" />
            CRM
          </span>
          {crmOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {crmOpen && (
          <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5">
            <NavItem href={`${base}/customers`} icon={Users} label="Customers" pathname={pathname} />
            <NavItem href={`${base}/suppliers`} icon={Building2} label="Suppliers" pathname={pathname} />
            <NavItem href={`${base}/technicians`} icon={Wrench} label="Technicians" pathname={pathname} />
          </div>
        )}

        {/* OPERATIONS */}
        <SectionLabel>Operations</SectionLabel>
        <NavItem href={`${base}/inventory`} icon={Package} label="Inventory" pathname={pathname} />
        <NavItem href={`${base}/sales`} icon={ShoppingCart} label="Sales" pathname={pathname} />
        <NavItem href={`${base}/purchases`} icon={ShoppingBag} label="Purchases" pathname={pathname} />
        <NavItem href={`${base}/billing`} icon={Receipt} label="Billing" pathname={pathname} />

        {/* COMMUNICATION */}
        <SectionLabel>Communication</SectionLabel>
        <NavItem href={`${base}/airtime`} icon={Phone} label="Airtime" pathname={pathname} />
        <NavItem href={`${base}/bulk-sms`} icon={MessageSquare} label="Bulk SMS" pathname={pathname} />

        {/* SYSTEM */}
        <SectionLabel>System</SectionLabel>
        <NavItem href={`${base}/documents`} icon={FileText} label="Documents" pathname={pathname} />
        <NavItem href={`${base}/gps-platforms`} icon={MapPin} label="GPS Platforms" pathname={pathname} />
        <NavItem href={`${base}/settings`} icon={Settings} label="Settings" pathname={pathname} />
      </nav>

      {/* Sign out */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 py-2 px-3 w-full rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-l-[3px] border-transparent"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
