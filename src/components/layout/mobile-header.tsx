"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Tenant } from "@prisma/client";

interface MobileHeaderProps {
  tenant: Tenant;
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard:    "Dashboard",
  customers:    "Customers",
  suppliers:    "Suppliers",
  technicians:  "Technicians",
  inventory:    "Inventory",
  sales:        "Sales",
  purchases:    "Purchases",
  billing:      "Billing",
  airtime:      "Airtime",
  "bulk-sms":   "Bulk SMS",
  documents:    "Documents",
  "gps-platforms": "GPS Platforms",
  settings:     "Settings",
  users:        "Team",
  products:     "Products",
};

export function MobileHeader({ tenant, onMenuClick }: MobileHeaderProps) {
  const pathname = usePathname();
  const segment  = pathname.split("/").pop() ?? "";
  const title    = PAGE_TITLES[segment] ?? tenant.name;

  return (
    <header className="sm:hidden bg-white border-b border-gray-100 px-4 flex items-center h-14 flex-shrink-0 relative">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-[#ede9fe] hover:text-[#6c5ce7] transition-colors z-10"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Centered page title */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 pointer-events-none">
        {title}
      </span>

      {/* Right — tenant avatar */}
      <div className="ml-auto z-10 h-8 w-8 rounded-full bg-[#6c5ce7] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        {tenant.name.charAt(0).toUpperCase()}
      </div>
    </header>
  );
}
