import { upsertDealershipMemory } from "@/lib/campaigns/memory/repository";
import { groupPipelineByBoardStage } from "@/lib/crm/repository";
import type { CrmPipelineWithLead } from "@/types/crm";

export async function syncCrmMemory({
  userId,
  dealershipName,
  entries,
}: {
  userId: string;
  dealershipName: string;
  entries: CrmPipelineWithLead[];
}) {
  const dealershipEntries = entries.filter(
    (entry) => entry.dealershipName === dealershipName,
  );
  const grouped = groupPipelineByBoardStage(dealershipEntries);
  const active = dealershipEntries.filter(
    (entry) => entry.stage !== "converted" && entry.stage !== "lost",
  );

  const dropOffStage =
    grouped.contacted.length > grouped.qualified.length && grouped.contacted.length >= 2
      ? "contacted_to_qualified"
      : grouped.new.length > grouped.contacted.length && grouped.new.length >= 2
        ? "new_to_contacted"
        : grouped.qualified.length > grouped.appointment_set.length &&
            grouped.qualified.length >= 2
          ? "qualified_to_appointment"
          : null;

  const highQualityLeads = dealershipEntries.filter(
    (entry) => entry.priority === "high" && entry.stage !== "lost",
  ).length;

  await upsertDealershipMemory({
    userId,
    dealershipName,
    memoryType: "crm_insights",
    memoryValue: {
      totalPipeline: dealershipEntries.length,
      activePipeline: active.length,
      highQualityLeads,
      conversionRate:
        dealershipEntries.length > 0
          ? Math.round(
              (grouped.converted.length / dealershipEntries.length) * 100,
            )
          : 0,
      dropOffStage,
      dropOffInsight: dropOffStage
        ? `Leads are stalling at ${dropOffStage.replace(/_/g, " ")} — tighten follow-up timing.`
        : "Pipeline flow is healthy across stages.",
      followUpRecommendation:
        grouped.new.length >= 2
          ? "Call new leads same-day — speed to contact drives conversion."
          : grouped.contacted.length >= 2
            ? "Send follow-up texts 2 days after first contact."
            : "Keep moving qualified leads to appointment set quickly.",
      stageCounts: {
        new: grouped.new.length,
        contacted: grouped.contacted.length,
        qualified: grouped.qualified.length,
        appointment_set: grouped.appointment_set.length,
        converted: grouped.converted.length,
        lost: grouped.lost.length,
      },
      source: "crm_lite",
      updatedAt: new Date().toISOString(),
    },
  });
}
