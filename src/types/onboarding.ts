export const DEALERSHIP_TYPES = [
  { value: "harley", label: "Harley-Davidson" },
  { value: "powersports", label: "Powersports" },
  { value: "multi_line", label: "Multi-line" },
  { value: "other", label: "Other" },
] as const;

export type DealershipType = (typeof DEALERSHIP_TYPES)[number]["value"];

export type FunnelStage =
  | "none"
  | "activation"
  | "engagement"
  | "dependence"
  | "attachment"
  | "conversion";

export type OnboardingState = {
  setupComplete: boolean;
  dealershipType?: DealershipType;
  funnelStage: FunnelStage;
  valueMomentsSeen: string[];
  demoInteractions: number;
  contextualStep?: "generate" | "results" | "schedule" | "leads" | null;
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  setupComplete: false,
  funnelStage: "none",
  valueMomentsSeen: [],
  demoInteractions: 0,
  contextualStep: null,
};
