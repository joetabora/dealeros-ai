import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth/session";
import { getOnboardingState } from "@/lib/onboarding/repository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
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
