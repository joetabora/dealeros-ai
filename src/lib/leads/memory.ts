import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { listLeads } from "@/lib/leads/repository";
import type { DealershipLead, IntentLevel, LeadSource } from "@/types/leads";

export async function syncLeadMemory({
  userId,
  dealershipName,
  lead,
  intentLevel,
}: {
  userId: string;
  dealershipName: string;
  lead: DealershipLead;
  intentLevel: IntentLevel;
}) {
  const allLeads = await listLeads(200);
  const dealershipLeads = allLeads.filter(
    (entry) => entry.dealershipName === dealershipName,
  );

  const bySource = dealershipLeads.reduce<Record<string, number>>((map, entry) => {
    map[entry.source] = (map[entry.source] ?? 0) + 1;
    return map;
  }, {});

  const topSource = Object.entries(bySource).sort((left, right) => right[1] - left[1])[0]?.[0] as
    | LeadSource
    | undefined;

  const byInterest = dealershipLeads.reduce<Record<string, number>>((map, entry) => {
    map[entry.interestType] = (map[entry.interestType] ?? 0) + 1;
    return map;
  }, {});

  const topInterest = Object.entries(byInterest).sort((left, right) => right[1] - left[1])[0]?.[0];

  await upsertDealershipMemory({
    userId,
    dealershipName,
    memoryType: "lead_insights",
    memoryValue: {
      highestLeadSources: Object.entries(bySource)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([source, count]) => ({ source, count })),
      bestConvertingCampaignTypes: Object.entries(byInterest)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([type, count]) => ({ type, count })),
      strongestCtaFormats:
        lead.source === "sms"
          ? ["Reply YES", "Reply BOOK", "Reply INFO"]
          : ["Schedule a test ride", "Book service appointment", "Visit dealership"],
      lastLeadSource: lead.source,
      lastInterestType: lead.interestType,
      lastIntentLevel: intentLevel,
      totalLeads: dealershipLeads.length,
      topSourceInsight: topSource
        ? `${topSource} is your highest lead source`
        : "Building lead source history",
      campaignTypeInsight: topInterest
        ? `${topInterest} campaigns generate the most captured leads`
        : null,
      source: "lead_capture",
      updatedAt: new Date().toISOString(),
    },
  });
}
