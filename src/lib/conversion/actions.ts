"use server";

import { revalidatePath } from "next/cache";

import {
  advanceFunnelStage,
  nextContextualStep,
} from "@/lib/conversion/funnel";
import { requireSession } from "@/lib/auth/session";
import {
  getOnboardingState,
  patchOnboardingState,
} from "@/lib/onboarding/repository";
import type { FunnelStage } from "@/types/onboarding";

export async function recordFunnelStageAction(stage: FunnelStage) {
  try {
    const session = await requireSession();
    const state = await getOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
    });

    const funnelStage = advanceFunnelStage(state.funnelStage, stage);
    const contextualStep = nextContextualStep(funnelStage);

    if (funnelStage === state.funnelStage && contextualStep === state.contextualStep) {
      return { success: true as const, stage: funnelStage };
    }

    await patchOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
      patch: {
        funnelStage,
        contextualStep,
      },
    });

    revalidatePath("/dashboard");

    return { success: true as const, stage: funnelStage };
  } catch {
    return { success: false as const, stage: "none" as FunnelStage };
  }
}
