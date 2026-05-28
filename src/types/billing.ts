export type BillableFeature =
  | "campaign_generator"
  | "scheduling"
  | "execution"
  | "crm_lite"
  | "autopilot"
  | "revenue_intelligence"
  | "multi_user";

export const PLAN_FEATURES: Record<
  import("@/types/tenant").BillingPlan,
  BillableFeature[]
> = {
  starter: ["campaign_generator", "scheduling"],
  growth: [
    "campaign_generator",
    "scheduling",
    "execution",
    "crm_lite",
    "revenue_intelligence",
  ],
  pro: [
    "campaign_generator",
    "scheduling",
    "execution",
    "crm_lite",
    "revenue_intelligence",
    "autopilot",
    "multi_user",
  ],
};

export const FEATURE_LABELS: Record<BillableFeature, string> = {
  campaign_generator: "Campaign Generator",
  scheduling: "Marketing Calendar",
  execution: "Auto Execution",
  crm_lite: "CRM Lite Pipeline",
  autopilot: "Marketing Autopilot",
  revenue_intelligence: "Revenue Intelligence",
  multi_user: "Multi-User Access",
};

export const PLAN_LIMITS = {
  starter: { campaignsPerMonth: 10 },
  growth: { campaignsPerMonth: 50 },
  pro: { campaignsPerMonth: 999 },
} as const;

export const UPGRADE_PLAN_FOR_FEATURE: Partial<
  Record<BillableFeature, import("@/types/tenant").BillingPlan>
> = {
  execution: "growth",
  crm_lite: "growth",
  revenue_intelligence: "growth",
  autopilot: "pro",
  multi_user: "pro",
};
