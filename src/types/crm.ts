import type { DealershipLead, IntentLevel } from "@/types/leads";

export const CRM_STAGES = [
  "new",
  "contacted",
  "qualified",
  "appointment_set",
  "converted",
  "lost",
] as const;

export type CrmStage = (typeof CRM_STAGES)[number];

export const CRM_BOARD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "appointment_set",
  "converted",
] as const;

export type CrmBoardStage = (typeof CRM_BOARD_STAGES)[number];

export const CRM_PRIORITIES = ["low", "medium", "high"] as const;

export type CrmPriority = (typeof CRM_PRIORITIES)[number];

export const CRM_NEXT_ACTIONS = ["call", "text", "email", "none"] as const;

export type CrmNextAction = (typeof CRM_NEXT_ACTIONS)[number];

export type CrmUrgencyLevel = "today" | "soon" | "scheduled" | "none";

export type CrmPipelineEntry = {
  id: string;
  userId: string;
  leadId: string;
  dealershipName: string;
  stage: CrmStage;
  priority: CrmPriority;
  nextAction: CrmNextAction;
  nextActionDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrmPipelineWithLead = CrmPipelineEntry & {
  lead: DealershipLead;
  recommendedAction: string;
  urgencyLevel: CrmUrgencyLevel;
  conversionLikelihood: number;
};

export type CrmPipelineSummary = {
  total: number;
  byStage: Record<CrmStage, number>;
  dueToday: number;
  highPriority: number;
  conversionRate: number;
};

export const CRM_STAGE_LABELS: Record<CrmStage, string> = {
  new: "New Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  appointment_set: "Appointment Set",
  converted: "Converted",
  lost: "Lost",
};

export const CRM_BOARD_STAGE_LABELS: Record<CrmBoardStage, string> = {
  new: "New Leads",
  contacted: "Contacted",
  qualified: "Qualified",
  appointment_set: "Appointment Set",
  converted: "Converted",
};

export const CRM_PRIORITY_LABELS: Record<CrmPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const CRM_PRIORITY_COLORS: Record<CrmPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-rose-500/15 text-rose-400",
};

export const CRM_NEXT_ACTION_LABELS: Record<CrmNextAction, string> = {
  call: "Call",
  text: "Text",
  email: "Email",
  none: "None",
};

export type CreatePipelineInput = {
  userId: string;
  lead: DealershipLead;
  intentLevel?: IntentLevel;
  engagementType?: string;
};
