import type { ScheduledContentType, ScheduledPlatform } from "@/types/scheduling";

export const CONTROL_MODES = ["manual", "assisted", "autopilot"] as const;

export type ControlMode = (typeof CONTROL_MODES)[number];

export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "edited",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type ApprovalContentSnapshot = {
  content: string;
  originalContent: string;
  scheduledFor: string;
  contentType: ScheduledContentType;
  campaignLabel?: string;
  eventName?: string;
  eventId?: string | null;
};

export type MarketingApproval = {
  id: string;
  userId: string;
  dealershipName: string;
  campaignId: string | null;
  scheduledActionId: string | null;
  contentSnapshot: ApprovalContentSnapshot;
  platform: ScheduledPlatform;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalAuditEntry = {
  id: string;
  userId: string;
  approvalId: string | null;
  dealershipName: string;
  action: string;
  actorLabel: string;
  originalContent: string | null;
  updatedContent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type DealershipControlSettings = {
  id: string;
  userId: string;
  dealershipName: string;
  controlMode: ControlMode;
  createdAt: string;
  updatedAt: string;
};

export const CONTROL_MODE_LABELS: Record<ControlMode, string> = {
  manual: "Manual Mode",
  assisted: "Assisted Mode",
  autopilot: "Autopilot Mode",
};

export const CONTROL_MODE_DESCRIPTIONS: Record<ControlMode, string> = {
  manual: "AI generates content. Nothing schedules or posts until you approve each item.",
  assisted: "AI generates and schedules. Execution waits for your approval before going live.",
  autopilot: "AI generates, schedules, and executes. You can override or reject at any time.",
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  edited: "Edited & Approved",
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  edited: "bg-primary/15 text-primary",
};

export type SubmitApprovalItem = {
  dealershipName: string;
  campaignId?: string | null;
  eventId?: string | null;
  scheduledActionId?: string | null;
  platform: ScheduledPlatform;
  contentType: ScheduledContentType;
  content: string;
  scheduledFor: string;
  campaignLabel?: string;
  eventName?: string;
};

export type ApprovalEditChanges = {
  content?: string;
  scheduledFor?: string;
};
