import { Role } from "@prisma/client";

export type { Role };

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
