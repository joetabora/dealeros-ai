import { getDemoDealership } from "@/config/demo-dealerships";
import type { ClosingKitContext } from "@/types/closing-kit";

export function buildClosingKitContextFromDemo(
  dealershipId: string,
  sampleExcerpt?: string,
): ClosingKitContext | null {
  const dealership = getDemoDealership(dealershipId);

  if (!dealership) return null;

  return {
    dealershipName: dealership.name,
    demoDealershipId: dealership.id,
    sampleExcerpt:
      sampleExcerpt ?? dealership.historySamples[0]?.excerpt ?? "",
    impactLifts: dealership.impact,
    roiDefaults: dealership.roiDefaults,
  };
}

export function parseClosingKitSearchParams(
  params: Record<string, string | string[] | undefined>,
): ClosingKitContext {
  const dealershipId = typeof params.dealership === "string" ? params.dealership : undefined;
  const excerpt = typeof params.excerpt === "string" ? params.excerpt : undefined;
  const name = typeof params.name === "string" ? params.name : undefined;

  if (dealershipId) {
    const fromDemo = buildClosingKitContextFromDemo(dealershipId, excerpt);
    if (fromDemo) return fromDemo;
  }

  return {
    dealershipName: name ?? "Your Dealership",
    sampleExcerpt: excerpt ?? "",
  };
}
