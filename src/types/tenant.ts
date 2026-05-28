export const USER_ROLES = ["owner", "manager", "marketer", "viewer"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const BILLING_PLANS = ["starter", "growth", "pro"] as const;

export type BillingPlan = (typeof BILLING_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "canceled",
  "past_due",
  "trialing",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type TenantContext = {
  dealershipId: string;
  dealershipName: string;
  role: UserRole;
  plan: BillingPlan;
  subscriptionStatus: SubscriptionStatus;
};

export type DealershipRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type DealershipMember = {
  id: string;
  dealershipId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
};

export type SubscriptionRecord = {
  id: string;
  dealershipId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: BillingPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  manager: "Manager",
  marketer: "Marketer",
  viewer: "Viewer",
};

export const PLAN_LABELS: Record<BillingPlan, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export type TenantScope = {
  userId: string;
  dealershipId: string;
  dealershipName: string;
  role: UserRole;
  plan: BillingPlan;
};
