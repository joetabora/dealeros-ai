import type { BillableFeature } from "@/types/billing";
import { PLAN_FEATURES, UPGRADE_PLAN_FOR_FEATURE } from "@/types/billing";
import type { BillingPlan, TenantContext } from "@/types/tenant";

export function getPlanFeatures(plan: BillingPlan) {
  return PLAN_FEATURES[plan];
}

export function hasPlanFeature(plan: BillingPlan, feature: BillableFeature) {
  return PLAN_FEATURES[plan].includes(feature);
}

export function getRequiredPlanForFeature(feature: BillableFeature): BillingPlan {
  return UPGRADE_PLAN_FOR_FEATURE[feature] ?? "pro";
}

export function getFeatureGateResult(tenant: TenantContext, feature: BillableFeature) {
  const allowed = hasPlanFeature(tenant.plan, feature);
  const requiredPlan = getRequiredPlanForFeature(feature);

  return {
    allowed,
    currentPlan: tenant.plan,
    requiredPlan,
    feature,
  };
}

export function canRunAutopilot(tenant: TenantContext) {
  return hasPlanFeature(tenant.plan, "autopilot");
}

export function canRunExecution(tenant: TenantContext) {
  return hasPlanFeature(tenant.plan, "execution");
}

export function canAccessCrm(tenant: TenantContext) {
  return hasPlanFeature(tenant.plan, "crm_lite");
}

export function canGenerateCampaign(tenant: TenantContext) {
  return hasPlanFeature(tenant.plan, "campaign_generator");
}

export function isWithinCampaignLimit(plan: BillingPlan, countThisMonth: number) {
  const limits = { starter: 10, growth: 50, pro: 999 } as const;
  return countThisMonth < limits[plan];
}
