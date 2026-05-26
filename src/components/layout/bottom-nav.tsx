"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Package, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  tenantSlug: string;
  onMenuClick: () => void;
}

const TABS = [
  { label: "Dashboard", path: "dashboard", Icon: LayoutDashboard },
  { label: "Sales",     path: "sales",     Icon: ShoppingCart },
  { label: "Customers", path: "customers", Icon: Users },
  { label: "Inventory", path: "inventory", Icon: Package },
] as const;

export function BottomNav({ tenantSlug, onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100"
      style={{
        boxShadow: "0 -4px 20px 0 rgba(108,92,231,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ label, path, Icon }) => {
          const href   = `/${tenantSlug}/${path}`;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={path}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5",
                "text-[10px] font-semibold transition-colors duration-150",
                active ? "text-[#6c5ce7]" : "text-gray-400",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-150",
                  active && "scale-110",
                )}
              />
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#6c5ce7]" />
              )}
            </Link>
          );
        })}

        {/* More — opens sidebar drawer */}
        <button
          onClick={onMenuClick}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400 transition-colors duration-150 active:text-[#6c5ce7]"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
