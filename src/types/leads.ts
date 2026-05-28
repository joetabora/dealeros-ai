export const LEAD_SOURCES = [
  "facebook",
  "instagram",
  "sms",
  "email",
  "event",
  "manual",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_INTEREST_TYPES = [
  "service",
  "sales",
  "event",
  "general",
] as const;

export type LeadInterestType = (typeof LEAD_INTEREST_TYPES)[number];

export const LEAD_STATUSES = ["new", "contacted", "converted", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type IntentLevel = "high" | "medium" | "low";

export type DealershipLead = {
  id: string;
  userId: string;
  dealershipName: string;
  campaignId: string | null;
  eventId: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  interestType: LeadInterestType;
  status: LeadStatus;
  createdAt: string;
  lastContactedAt: string | null;
};

export type LeadCaptureInput = {
  userId: string;
  dealershipName: string;
  dealershipId?: string;
  campaignId?: string | null;
  eventId?: string | null;
  source: LeadSource;
  interestType?: LeadInterestType;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  engagementType?: string;
  intentLevel?: IntentLevel;
};

export type LeadCaptureLayer = {
  primaryCta: string;
  trackingTriggers: string[];
  smsKeywords: string[];
  estimatedLeads: number;
  conversionPotentialScore: number;
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  sms: "SMS",
  email: "Email",
  event: "Event",
  manual: "Manual",
};

export const LEAD_INTEREST_LABELS: Record<LeadInterestType, string> = {
  service: "Service",
  sales: "Sales",
  event: "Event",
  general: "General",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-amber-500/15 text-amber-400",
  converted: "bg-emerald-500/15 text-emerald-400",
  lost: "bg-destructive/15 text-destructive",
};

export type LeadSummary = {
  total: number;
  new: number;
  contacted: number;
  converted: number;
  bySource: Record<LeadSource, number>;
};
