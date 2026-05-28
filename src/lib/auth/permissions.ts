import type { TenantContext, UserRole } from "@/types/tenant";
import type { BillableFeature } from "@/types/billing";
import { PLAN_FEATURES } from "@/types/billing";

const ROLE_RANK: Record<UserRole, number> = {
  owner: 4,
  manager: 3,
  marketer: 2,
  viewer: 1,
};

function hasMinRole(role: UserRole, minimum: UserRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function hasFeatureAccess(plan: TenantContext["plan"], feature: BillableFeature) {
  return PLAN_FEATURES[plan].includes(feature);
}

export function canCreateCampaign(tenant: TenantContext) {
  return hasMinRole(tenant.role, "marketer");
}

export function canApproveMarketing(tenant: TenantContext) {
  return hasMinRole(tenant.role, "manager");
}

export function canViewAnalytics(tenant: TenantContext) {
  return hasMinRole(tenant.role, "viewer");
}

export function canManageBilling(tenant: TenantContext) {
  return tenant.role === "owner";
}

export function canManageUsers(tenant: TenantContext) {
  return tenant.role === "owner";
}

export function canAccessFeature(tenant: TenantContext, feature: BillableFeature) {
  if (!hasFeatureAccess(tenant.plan, feature)) return false;

  if (feature === "autopilot" || feature === "revenue_intelligence") {
    return hasMinRole(tenant.role, "manager");
  }

  if (feature === "crm_lite") {
    return hasMinRole(tenant.role, "marketer");
  }

  if (feature === "execution" || feature === "scheduling") {
    return hasMinRole(tenant.role, "marketer");
  }

  return hasMinRole(tenant.role, "viewer");
}

export function assertPermission(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}
