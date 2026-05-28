import { getSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClosingKitDemoShell } from "@/components/closing-kit/closing-kit-demo-shell";
import { getOnboardingState } from "@/lib/onboarding/repository";

type ClosingKitShellProps = {
  children: React.ReactNode;
};

export async function ClosingKitShell({ children }: ClosingKitShellProps) {
  const session = await getSession();

  if (session) {
    const onboarding = await getOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
    });

    return (
      <DashboardShell session={session} onboarding={onboarding}>
        {children}
      </DashboardShell>
    );
  }

  return <ClosingKitDemoShell>{children}</ClosingKitDemoShell>;
}
