import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { getFeatureGateResult } from "@/lib/billing/feature-gates";
import type { BillableFeature } from "@/types/billing";
import type { TenantContext } from "@/types/tenant";

type FeatureGateProps = {
  tenant: TenantContext;
  feature: BillableFeature;
  children: React.ReactNode;
};

export function FeatureGate({ tenant, feature, children }: FeatureGateProps) {
  const gate = getFeatureGateResult(tenant, feature);

  if (!gate.allowed) {
    return <UpgradePrompt feature={feature} currentPlan={tenant.plan} />;
  }

  return <>{children}</>;
}
