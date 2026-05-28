export const SCHEDULED_PLATFORMS = [
  "facebook",
  "instagram",
  "sms",
  "email",
] as const;

export type ScheduledPlatform = (typeof SCHEDULED_PLATFORMS)[number];

export const SCHEDULED_CONTENT_TYPES = [
  "post",
  "reminder",
  "announcement",
  "follow_up",
] as const;

export type ScheduledContentType = (typeof SCHEDULED_CONTENT_TYPES)[number];

export const SCHEDULED_STATUSES = ["pending", "sent", "skipped", "failed"] as const;

export type ScheduledStatus = (typeof SCHEDULED_STATUSES)[number];

export const EXECUTION_STATUSES = ["pending", "sent", "failed"] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export type ProviderResponse = Record<string, unknown>;

export type ScheduledMarketingAction = {
  id: string;
  userId: string;
  dealershipName: string;
  campaignId: string | null;
  eventId: string | null;
  platform: ScheduledPlatform;
  contentType: ScheduledContentType;
  content: string;
  scheduledFor: string;
  status: ScheduledStatus;
  executionStatus: ExecutionStatus;
  executedAt: string | null;
  providerResponse: ProviderResponse | null;
  createdAt: string;
};

export type ScheduledActionGroup = {
  dateKey: string;
  dateLabel: string;
  actions: ScheduledMarketingAction[];
};

export const PLATFORM_LABELS: Record<ScheduledPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  sms: "SMS",
  email: "Email",
};

export const PLATFORM_COLORS: Record<ScheduledPlatform, string> = {
  facebook: "bg-blue-500/15 text-blue-400",
  instagram: "bg-pink-500/15 text-pink-400",
  sms: "bg-emerald-500/15 text-emerald-400",
  email: "bg-amber-500/15 text-amber-400",
};

export const CONTENT_TYPE_LABELS: Record<ScheduledContentType, string> = {
  post: "Post",
  reminder: "Reminder",
  announcement: "Announcement",
  follow_up: "Follow-up",
};

export const STATUS_LABELS: Record<ScheduledStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  skipped: "Skipped",
  failed: "Failed",
};

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
};
