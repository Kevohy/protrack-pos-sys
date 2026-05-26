"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { BottomNav } from "./bottom-nav";
import type { Tenant, Role } from "@prisma/client";

interface LayoutShellProps {
  children: React.ReactNode;
  tenant: Tenant;
  role: Role;
}

export function LayoutShell({ children, tenant, role }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f4f6fb" }}>
      <Sidebar
        tenant={tenant}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader tenant={tenant} onMenuClick={() => setSidebarOpen(true)} />

        {/* pb-20 on mobile leaves room above the fixed bottom nav (h-16 + safe area) */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 sm:p-6 sm:pb-6">
          {children}
        </main>
      </div>

      {/* Fixed bottom nav — sm:hidden inside the component */}
      <BottomNav tenantSlug={tenant.slug} onMenuClick={() => setSidebarOpen(true)} />
    </div>
  );
}
