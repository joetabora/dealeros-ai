import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { listDealershipMemory } from "@/lib/campaigns/memory/repository";
import { listMarketingCampaigns } from "@/lib/marketing/repository";
import {
  DEFAULT_ONBOARDING_STATE,
  type DealershipType,
  type FunnelStage,
  type OnboardingState,
} from "@/types/onboarding";

function parseOnboardingState(
  value: Record<string, unknown> | undefined,
): OnboardingState {
  if (!value) {
    return { ...DEFAULT_ONBOARDING_STATE };
  }

  return {
    setupComplete: Boolean(value.setupComplete),
    dealershipType: value.dealershipType as DealershipType | undefined,
    funnelStage: (value.funnelStage as FunnelStage | undefined) ?? "none",
    valueMomentsSeen: (value.valueMomentsSeen as string[] | undefined) ?? [],
    demoInteractions: (value.demoInteractions as number | undefined) ?? 0,
    contextualStep:
      (value.contextualStep as OnboardingState["contextualStep"]) ?? null,
  };
}

export async function getOnboardingState({
  userId,
  dealershipId,
  dealershipName,
}: {
  userId: string;
  dealershipId: string;
  dealershipName: string;
}): Promise<OnboardingState> {
  try {
    const records = await listDealershipMemory(userId, dealershipName);
    const stored = records.find((entry) => entry.memoryType === "onboarding_state");

    if (stored) {
      return parseOnboardingState(stored.memoryValue);
    }

    const campaigns = await listMarketingCampaigns(1);
    if (campaigns.length > 0) {
      return {
        ...DEFAULT_ONBOARDING_STATE,
        setupComplete: true,
        funnelStage: "activation",
      };
    }

    return { ...DEFAULT_ONBOARDING_STATE };
  } catch {
    return { ...DEFAULT_ONBOARDING_STATE };
  }
}

export async function saveOnboardingState({
  userId,
  dealershipId,
  dealershipName,
  state,
}: {
  userId: string;
  dealershipId: string;
  dealershipName: string;
  state: OnboardingState;
}): Promise<void> {
  await upsertDealershipMemory({
    userId,
    dealershipId,
    dealershipName,
    memoryType: "onboarding_state",
    memoryValue: state as unknown as Record<string, unknown>,
  });
}

export async function patchOnboardingState({
  userId,
  dealershipId,
  dealershipName,
  patch,
}: {
  userId: string;
  dealershipId: string;
  dealershipName: string;
  patch: Partial<OnboardingState>;
}): Promise<OnboardingState> {
  const current = await getOnboardingState({
    userId,
    dealershipId,
    dealershipName,
  });
  const next = { ...current, ...patch };

  await saveOnboardingState({
    userId,
    dealershipId,
    dealershipName,
    state: next,
  });

  return next;
}
