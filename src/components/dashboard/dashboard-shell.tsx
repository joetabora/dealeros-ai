"use client";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SetupBanner } from "@/components/onboarding/setup-banner";
import { SetupRedirect } from "@/components/onboarding/setup-redirect";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Session } from "@/types/auth";
import type { OnboardingState } from "@/types/onboarding";

type DashboardShellProps = {
  session: Session;
  onboarding: OnboardingState;
  children: React.ReactNode;
};

export function DashboardShell({
  session,
  onboarding,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith("/dashboard/onboarding");

  return (
    <SidebarProvider defaultOpen>
      <SetupRedirect setupComplete={onboarding.setupComplete} />
      <AppSidebar session={session} />
      <SidebarInset className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <DashboardHeader session={session} pathname={pathname} />
        {!isOnboardingRoute ? <SetupBanner onboarding={onboarding} /> : null}
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
