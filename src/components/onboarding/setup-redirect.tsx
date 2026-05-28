"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type SetupRedirectProps = {
  setupComplete: boolean;
};

export function SetupRedirect({ setupComplete }: SetupRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (setupComplete) return;
    if (pathname.startsWith("/dashboard/onboarding")) return;

    router.replace("/dashboard/onboarding");
  }, [setupComplete, pathname, router]);

  return null;
}
