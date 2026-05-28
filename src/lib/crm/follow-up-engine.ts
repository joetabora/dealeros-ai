import type {
  CrmNextAction,
  CrmPipelineEntry,
  CrmPriority,
  CrmStage,
  CrmUrgencyLevel,
} from "@/types/crm";
import type { DealershipLead, IntentLevel } from "@/types/leads";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(17, 0, 0, 0);
  return next;
}

export function inferPipelinePriority({
  lead,
  intentLevel,
  engagementType,
}: {
  lead: DealershipLead;
  intentLevel?: IntentLevel;
  engagementType?: string;
}): CrmPriority {
  const keyword = engagementType?.toUpperCase();

  if (keyword === "BOOK") return "high";
  if (intentLevel === "high") return "high";
  if (lead.source === "sms" && keyword === "INFO") return "medium";
  if (lead.source === "event" || lead.interestType === "event") return "medium";
  if (intentLevel === "medium") return "medium";
  if (lead.interestType === "sales" || lead.interestType === "service") return "medium";
  return "low";
}

export function inferFollowUpForStage(
  stage: CrmStage,
  lead: DealershipLead,
): { nextAction: CrmNextAction; nextActionDate: Date | null } {
  const now = new Date();

  switch (stage) {
    case "new":
      return {
        nextAction: lead.phone ? "call" : lead.email ? "email" : "text",
        nextActionDate: startOfDay(now),
      };
    case "contacted":
      return {
        nextAction: lead.phone ? "text" : "email",
        nextActionDate: startOfDay(addDays(now, 2)),
      };
    case "qualified":
      return {
        nextAction: lead.phone ? "text" : "email",
        nextActionDate: startOfDay(addDays(now, 2)),
      };
    case "appointment_set":
      return {
        nextAction: lead.phone ? "text" : "call",
        nextActionDate: startOfDay(addDays(now, 1)),
      };
    case "converted":
    case "lost":
      return { nextAction: "none", nextActionDate: null };
    default:
      return { nextAction: "call", nextActionDate: startOfDay(now) };
  }
}

export function buildRecommendedAction(
  entry: Pick<CrmPipelineEntry, "stage" | "nextAction" | "priority">,
  lead: DealershipLead,
): string {
  const contact = lead.name ?? "this lead";

  switch (entry.stage) {
    case "new":
      return entry.nextAction === "call"
        ? `Call ${contact} today — ${entry.priority} priority ${lead.interestType} lead from ${lead.source}.`
        : `Send a first-touch ${entry.nextAction === "text" ? "text" : "email"} to ${contact} today.`;
    case "contacted":
      return `Follow up with ${contact} via ${entry.nextAction === "text" ? "SMS" : "email"} to confirm interest.`;
    case "qualified":
      return `Schedule a ${lead.interestType === "service" ? "service appointment" : "showroom visit"} with ${contact}.`;
    case "appointment_set":
      return `Send appointment reminder to ${contact} — confirm they are still coming.`;
    case "converted":
      return "Sale or service completed — no follow-up needed.";
    case "lost":
      return "Lead closed — move on to active pipeline items.";
    default:
      return "Review this lead and choose the next best action.";
  }
}

export function estimateConversionLikelihood(
  entry: Pick<CrmPipelineEntry, "stage" | "priority">,
  lead: DealershipLead,
): number {
  const baseByStage: Record<CrmStage, number> = {
    new: 18,
    contacted: 32,
    qualified: 55,
    appointment_set: 72,
    converted: 100,
    lost: 0,
  };

  const priorityBoost = { low: 0, medium: 8, high: 15 };
  const sourceBoost =
    lead.source === "sms" ? 10 : lead.source === "event" ? 6 : lead.source === "email" ? 4 : 0;
  const interestBoost =
    lead.interestType === "sales" ? 8 : lead.interestType === "service" ? 6 : 0;

  return Math.min(
    95,
    baseByStage[entry.stage] + priorityBoost[entry.priority] + sourceBoost + interestBoost,
  );
}

export function resolveUrgencyLevel(nextActionDate: string | null): CrmUrgencyLevel {
  if (!nextActionDate) return "none";

  const due = new Date(nextActionDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) return "today";
  if (diffMs <= 1000 * 60 * 60 * 24 * 2) return "soon";
  return "scheduled";
}

export function enrichPipelineEntry(
  entry: CrmPipelineEntry,
  lead: DealershipLead,
): {
  recommendedAction: string;
  urgencyLevel: CrmUrgencyLevel;
  conversionLikelihood: number;
} {
  return {
    recommendedAction: buildRecommendedAction(entry, lead),
    urgencyLevel: resolveUrgencyLevel(entry.nextActionDate),
    conversionLikelihood: estimateConversionLikelihood(entry, lead),
  };
}

export function mapStageToLeadStatus(stage: CrmStage) {
  if (stage === "contacted" || stage === "qualified" || stage === "appointment_set") {
    return "contacted" as const;
  }
  if (stage === "converted") return "converted" as const;
  if (stage === "lost") return "lost" as const;
  return "new" as const;
}
