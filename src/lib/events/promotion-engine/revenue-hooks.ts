import type { SeededRandom } from "@/lib/demo-ai/types";

export const REVENUE_HOOKS = [
  "Stop in today and check out inventory",
  "Talk to our team about current offers",
  "Schedule a test ride",
  "Service specials available during the event",
  "Limited-time dealership incentives",
] as const;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ");
}

export function hasRevenueHook(content: string) {
  const normalized = normalize(content);

  return REVENUE_HOOKS.some((hook) =>
    normalized.includes(normalize(hook)),
  );
}

export function injectRevenueHook(content: string, rng: SeededRandom) {
  if (hasRevenueHook(content)) {
    return content;
  }

  const hook = rng.pick(REVENUE_HOOKS);
  return `${content.trim()}\n\n${hook}.`;
}
