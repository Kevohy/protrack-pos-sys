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
  isOpen: boolean;
  onClose: () => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  pathname,
  onClose,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
  onClose: () => void;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      title={label}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        "sm:justify-center lg:justify-start",
        active
          ? "bg-[#6c5ce7] text-white shadow-sm"
          : "text-gray-600 hover:bg-[#ede9fe] hover:text-[#6c5ce7]"
      )}
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
      <span className="sm:hidden lg:inline">{label}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="sm:hidden lg:block px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 select-none">
        {children}
      </p>
      <div className="hidden sm:block lg:hidden mt-3 mb-1 mx-2 border-t border-gray-100" />
    </>
  );
}

export function Sidebar({ tenant, role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const base     = `/${tenant.slug}`;

  const crmRoutes  = [`${base}/customers`, `${base}/suppliers`, `${base}/technicians`];
  const isCrmActive = crmRoutes.some((r) => pathname.startsWith(r));
  const [crmOpen, setCrmOpen] = useState(() => isCrmActive);

  // Pre-bind onClose so every NavItem gets it
  const nav = (href: string, icon: React.ElementType, label: string) => (
    <NavItem href={href} icon={icon} label={label} pathname={pathname} onClose={onClose} />
  );

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-20 transition-opacity duration-300 sm:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "flex flex-col bg-white border-r border-gray-100 flex-shrink-0",
          "fixed inset-y-0 left-0 z-30 w-72 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "sm:relative sm:translate-x-0 sm:z-auto sm:w-16",
          "lg:w-64"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 sm:justify-center lg:justify-start sm:px-2 lg:px-4">
          <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-[#6c5ce7] flex items-center justify-center text-white font-bold text-sm">
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="sm:hidden lg:block min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{tenant.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{role}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">

          <SectionLabel>Main</SectionLabel>
          {nav(`${base}/dashboard`, LayoutDashboard, "Dashboard")}

          <SectionLabel>CRM</SectionLabel>

          {/* Mobile + desktop: collapsible CRM */}
          <div className="sm:hidden lg:block">
            <button
              onClick={() => setCrmOpen((o) => !o)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isCrmActive
                  ? "bg-[#6c5ce7] text-white shadow-sm"
                  : "text-gray-600 hover:bg-[#ede9fe] hover:text-[#6c5ce7]"
              )}
            >
              <span className="flex items-center gap-3">
                <Users className="h-[18px] w-[18px] flex-shrink-0" />
                <span>CRM</span>
              </span>
              {crmOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {crmOpen && (
              <div className="mt-0.5 ml-4 pl-3 border-l-2 border-[#ede9fe] space-y-0.5">
                {nav(`${base}/customers`,  Users,     "Customers")}
                {nav(`${base}/suppliers`,  Building2, "Suppliers")}
                {nav(`${base}/technicians`, Wrench,   "Technicians")}
              </div>
            )}
          </div>

          {/* Tablet: flat CRM icons */}
          <div className="hidden sm:block lg:hidden space-y-0.5">
            {nav(`${base}/customers`,  Users,     "Customers")}
            {nav(`${base}/suppliers`,  Building2, "Suppliers")}
            {nav(`${base}/technicians`, Wrench,   "Technicians")}
          </div>

          <SectionLabel>Operations</SectionLabel>
          {nav(`${base}/inventory`, Package,     "Inventory")}
          {nav(`${base}/sales`,     ShoppingCart, "Sales")}
          {nav(`${base}/purchases`, ShoppingBag,  "Purchases")}
          {nav(`${base}/billing`,   Receipt,      "Billing")}

          <SectionLabel>Communication</SectionLabel>
          {nav(`${base}/airtime`,  Phone,         "Airtime")}
          {nav(`${base}/bulk-sms`, MessageSquare, "Bulk SMS")}

          <SectionLabel>System</SectionLabel>
          {nav(`${base}/documents`,     FileText, "Documents")}
          {nav(`${base}/gps-platforms`, MapPin,   "GPS Platforms")}
          {nav(`${base}/settings`,      Settings, "Settings")}
        </nav>

        {/* Sign out */}
        <div className="px-2 py-3 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
              "text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150",
              "sm:justify-center lg:justify-start"
            )}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="sm:hidden lg:inline">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
