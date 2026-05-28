"use client";

import { useEffect } from "react";

import { recordFunnelStageAction } from "@/lib/conversion/actions";
import type { FunnelStage } from "@/types/onboarding";

type FunnelTrackerProps = {
  stage: FunnelStage;
};

export function FunnelTracker({ stage }: FunnelTrackerProps) {
  useEffect(() => {
    void recordFunnelStageAction(stage);
  }, [stage]);

  return null;
}
