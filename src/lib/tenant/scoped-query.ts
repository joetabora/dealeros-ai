import type { TenantScope } from "@/types/tenant";

export function withDealershipId<T extends Record<string, unknown>>(
  payload: T,
  scope: Pick<TenantScope, "dealershipId">,
) {
  return {
    ...payload,
    dealership_id: scope.dealershipId,
  };
}

export function applyTenantFilter<
  T extends { eq: (column: string, value: string) => T },
>(query: T, scope: Pick<TenantScope, "dealershipId">) {
  return query.eq("dealership_id", scope.dealershipId);
}

export const DEFAULT_PAGE_SIZE = 50;

export function clampPageSize(limit?: number) {
  if (!limit || limit < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(limit, 200);
}
