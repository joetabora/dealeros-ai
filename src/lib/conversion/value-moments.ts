export type ValueMomentKey =
  | "first_campaign"
  | "analytics_view"
  | "lead_capture"
  | "onboarding_complete";

export type ValueMoment = {
  key: ValueMomentKey;
  title: string;
  message: string;
};

export const VALUE_MOMENTS: Record<ValueMomentKey, ValueMoment> = {
  first_campaign: {
    key: "first_campaign",
    title: "Hours saved",
    message:
      "This would normally take a marketing team 2–3 hours. You did it in seconds.",
  },
  analytics_view: {
    key: "analytics_view",
    title: "Performance insight",
    message:
      "This campaign outperformed your average engagement by 32% (simulated model).",
  },
  lead_capture: {
    key: "lead_capture",
    title: "CRM built in",
    message: "This would normally require a separate CRM system.",
  },
  onboarding_complete: {
    key: "onboarding_complete",
    title: "System ready",
    message:
      "Your dealership marketing system is live with sample campaigns, events, and leads.",
  },
};

export function getValueMoment(key: ValueMomentKey): ValueMoment {
  return VALUE_MOMENTS[key];
}
