import type { FunnelStage } from "@/types/onboarding";

const FUNNEL_ORDER: FunnelStage[] = [
  "none",
  "activation",
  "engagement",
  "dependence",
  "attachment",
  "conversion",
];

export function advanceFunnelStage(
  current: FunnelStage,
  target: FunnelStage,
): FunnelStage {
  const currentIndex = FUNNEL_ORDER.indexOf(current);
  const targetIndex = FUNNEL_ORDER.indexOf(target);

  if (targetIndex <= currentIndex) {
    return current;
  }

  return target;
}

export function shouldShowConversionPrompt(stage: FunnelStage): boolean {
  return stage === "attachment" || stage === "conversion";
}

export function getContextualSetupMessage(
  step: "generate" | "results" | "schedule" | "leads" | null,
): string | null {
  switch (step) {
    case "generate":
      return "Generate your first campaign to unlock full automation.";
    case "results":
      return "Review what's working to fine-tune your marketing.";
    case "schedule":
      return "Check your auto-posting schedule to see automation in action.";
    case "leads":
      return "Open Leads to see your customer pipeline.";
    default:
      return null;
  }
}

export function nextContextualStep(
  stage: FunnelStage,
): "generate" | "results" | "schedule" | "leads" | null {
  switch (stage) {
    case "none":
      return "generate";
    case "activation":
      return "results";
    case "engagement":
      return "schedule";
    case "dependence":
      return "leads";
    default:
      return null;
  }
}
