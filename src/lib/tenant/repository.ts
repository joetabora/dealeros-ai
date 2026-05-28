import { createClient } from "@/lib/supabase/server";
import type {
  BillingPlan,
  DealershipMember,
  DealershipRecord,
  SubscriptionRecord,
  SubscriptionStatus,
  TenantContext,
  UserRole,
} from "@/types/tenant";

type DealershipRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type MemberRow = {
  id: string;
  dealership_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  dealership_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
};

function slugify(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "dealership"}-${userId.slice(0, 8)}`;
}

function mapDealership(row: DealershipRow): DealershipRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

function mapMember(row: MemberRow): DealershipMember {
  return {
    id: row.id,
    dealershipId: row.dealership_id,
    userId: row.user_id,
    role: row.role as UserRole,
    createdAt: row.created_at,
  };
}

function mapSubscription(row: SubscriptionRow): SubscriptionRecord {
  return {
    id: row.id,
    dealershipId: row.dealership_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    plan: row.plan as BillingPlan,
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: row.current_period_end,
  };
}

export async function getPrimaryMembership(userId: string) {
  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("dealership_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) return null;

  const { data: dealership, error: dealershipError } = await supabase
    .from("dealerships")
    .select("*")
    .eq("id", (member as MemberRow).dealership_id)
    .single();

  if (dealershipError) {
    throw new Error(dealershipError.message);
  }

  return {
    member: mapMember(member as MemberRow),
    dealership: mapDealership(dealership as DealershipRow),
  };
}

export async function getSubscriptionForDealership(dealershipId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapSubscription(data as SubscriptionRow) : null;
}

export async function createDealershipForUser({
  userId,
  dealershipName,
  role = "owner",
  plan = "growth",
}: {
  userId: string;
  dealershipName: string;
  role?: UserRole;
  plan?: BillingPlan;
}) {
  const supabase = await createClient();
  const slug = slugify(dealershipName, userId);

  const { data: dealership, error: dealershipError } = await supabase
    .from("dealerships")
    .insert({ name: dealershipName, slug })
    .select("*")
    .single();

  if (dealershipError) {
    throw new Error(dealershipError.message);
  }

  const dealershipRecord = mapDealership(dealership as DealershipRow);

  const { error: memberError } = await supabase.from("dealership_members").insert({
    dealership_id: dealershipRecord.id,
    user_id: userId,
    role,
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").insert({
    dealership_id: dealershipRecord.id,
    plan,
    status: "active",
  });

  if (subscriptionError) {
    throw new Error(subscriptionError.message);
  }

  return dealershipRecord;
}

export async function resolveTenantContext({
  userId,
  fallbackDealershipName,
}: {
  userId: string;
  fallbackDealershipName: string;
}): Promise<TenantContext> {
  let membership = await getPrimaryMembership(userId);

  if (!membership) {
    const dealership = await createDealershipForUser({
      userId,
      dealershipName: fallbackDealershipName,
    });
    membership = {
      member: {
        id: "",
        dealershipId: dealership.id,
        userId,
        role: "owner",
        createdAt: dealership.createdAt,
      },
      dealership,
    };
  }

  const subscription =
    (await getSubscriptionForDealership(membership.dealership.id)) ??
    ({
      plan: "growth",
      status: "active",
    } as Pick<SubscriptionRecord, "plan" | "status">);

  const activePlan =
    subscription.status === "active" || subscription.status === "trialing"
      ? subscription.plan
      : "starter";

  return {
    dealershipId: membership.dealership.id,
    dealershipName: membership.dealership.name,
    role: membership.member.role,
    plan: activePlan,
    subscriptionStatus: subscription.status ?? "active",
  };
}

export function toTenantScope(
  userId: string,
  tenant: TenantContext,
): import("@/types/tenant").TenantScope {
  return {
    userId,
    dealershipId: tenant.dealershipId,
    dealershipName: tenant.dealershipName,
    role: tenant.role,
    plan: tenant.plan,
  };
}
