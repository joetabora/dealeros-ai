import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/types/auth";

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

function mapUserToSession(user: User): Session {
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
      id: user.id,
      name: getDealerName(user),
    },
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

  return mapUserToSession(user);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
