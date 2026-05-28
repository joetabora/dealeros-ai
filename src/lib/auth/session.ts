import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { resolveTenantContext, toTenantScope } from "@/lib/tenant/repository";
import type { Session } from "@/types/auth";
import type { TenantScope } from "@/types/tenant";

function getDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};

  if (typeof metadata.full_name === "string" && metadata.full_name.trim()) {
    return metadata.full_name.trim();
  }

  if (typeof metadata.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }

  if (user.email) {
    return user.email.split("@")[0] ?? "User";
  }

  return "User";
}

function getDealerName(user: User) {
  const metadata = user.user_metadata ?? {};

  if (typeof metadata.dealer_name === "string" && metadata.dealer_name.trim()) {
    return metadata.dealer_name.trim();
  }

  if (typeof metadata.organization === "string" && metadata.organization.trim()) {
    return metadata.organization.trim();
  }

  return "Your Dealership";
}

async function buildSession(user: User): Promise<Session> {
  const fallbackDealershipName = getDealerName(user);

  let tenant;
  try {
    tenant = await resolveTenantContext({
      userId: user.id,
      fallbackDealershipName,
    });
  } catch {
    tenant = {
      dealershipId: user.id,
      dealershipName: fallbackDealershipName,
      role: "owner" as const,
      plan: "growth" as const,
      subscriptionStatus: "active" as const,
    };
  }

  return {
    user: {
      id: user.id,
      name: getDisplayName(user),
      email: user.email ?? "",
      avatarUrl:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : undefined,
    },
    dealer: {
      id: tenant.dealershipId,
      name: tenant.dealershipName,
    },
    tenant,
  };
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return buildSession(user);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireTenant(): Promise<Session & { scope: TenantScope }> {
  const session = await requireSession();
  return {
    ...session,
    scope: toTenantScope(session.user.id, session.tenant),
  };
}

export function getTenantScope(session: Session): TenantScope {
  return toTenantScope(session.user.id, session.tenant);
}
