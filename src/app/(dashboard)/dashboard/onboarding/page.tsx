import { PageContainer } from "@/components/layout/page-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireSession } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const session = await requireSession();

  return (
    <PageContainer className="max-w-3xl">
      <OnboardingWizard defaultDealershipName={session.dealer.name} />
    </PageContainer>
  );
}
