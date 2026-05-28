"use server";

import { revalidatePath } from "next/cache";

import { advanceFunnelStage } from "@/lib/conversion/funnel";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import {
  getOnboardingState,
  patchOnboardingState,
  saveOnboardingState,
} from "@/lib/onboarding/repository";
import { seedOnboardingData } from "@/lib/onboarding/seed";
import type { DealershipType } from "@/types/onboarding";

function revalidateOnboardingRoutes() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/autopilot");
}

export async function completeOnboardingSetupAction({
  dealershipName,
  dealershipType,
}: {
  dealershipName: string;
  dealershipType: DealershipType;
}) {
  try {
    const session = await requireSession();
    const trimmedName = dealershipName.trim();

    if (!trimmedName) {
      return { error: "Enter your dealership name to continue." };
    }

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("dealerships")
      .update({ name: trimmedName })
      .eq("id", session.tenant.dealershipId);

    if (updateError) {
      return { error: updateError.message };
    }

    await seedOnboardingData({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: trimmedName,
      dealershipType,
    });

    await saveOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: trimmedName,
      state: {
        setupComplete: true,
        dealershipType,
        funnelStage: "activation",
        valueMomentsSeen: ["onboarding_complete", "first_campaign"],
        demoInteractions: 0,
        contextualStep: "results",
      },
    });

    revalidateOnboardingRoutes();

    return { success: true as const };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Setup failed. Please try again.",
    };
  }
}

export async function markValueMomentSeenAction(momentKey: string) {
  try {
    const session = await requireSession();
    const state = await getOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
    });

    if (state.valueMomentsSeen.includes(momentKey)) {
      return { success: true as const };
    }

    await patchOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
      patch: {
        valueMomentsSeen: [...state.valueMomentsSeen, momentKey],
      },
    });

    return { success: true as const };
  } catch {
    return { success: true as const };
  }
}

export async function recordDemoInteractionAction() {
  try {
    const session = await requireSession();
    const state = await getOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
    });

    await patchOnboardingState({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.tenant.dealershipName,
      patch: {
        demoInteractions: state.demoInteractions + 1,
      },
    });

    return { success: true as const, interactions: state.demoInteractions + 1 };
  } catch {
    return { success: false as const, interactions: 0 };
  }
}
