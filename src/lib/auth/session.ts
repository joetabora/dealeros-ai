import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import type { Session } from "@/types/auth";

const DEMO_SESSION: Session = {
  user: {
    id: "demo-user",
    name: "Jordan Rivera",
    email: "jordan@metroautogroup.com",
  },
  dealer: {
    id: "demo-dealer",
    name: "Metro Auto Group",
  },
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  // Placeholder until Supabase session validation is wired.
  return DEMO_SESSION;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
