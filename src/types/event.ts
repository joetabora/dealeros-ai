export const EVENT_TYPES = [
  { value: "bike_night", label: "Bike Night" },
  { value: "service_clinic", label: "Service Clinic" },
  { value: "sale", label: "Sale" },
  { value: "community_event", label: "Community Event" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

export type EventInput = {
  eventName: string;
  eventType: EventType;
  description: string;
  eventDate: string;
};

export type PromotionPhase =
  | "pre_event"
  | "countdown"
  | "day_of"
  | "post_event";

export type PromotionPlatform = "facebook" | "instagram" | "sms" | "email";

export type PromotionPackItem = {
  id: string;
  phase: PromotionPhase;
  label: string;
  platform: PromotionPlatform;
  content: string;
};

export type EventPromotionPack = {
  generatedAt: string;
  items: PromotionPackItem[];
};

export type DealershipEvent = {
  id: string;
  userId: string;
  dealershipName: string;
  eventName: string;
  eventType: EventType;
  description: string;
  eventDate: string;
  createdAt: string;
  promotionPack?: EventPromotionPack | null;
};

export type EventFormState = {
  error?: string;
  success?: boolean;
  event?: DealershipEvent;
};

export const PROMOTION_PHASE_LABELS: Record<PromotionPhase, string> = {
  pre_event: "Pre-Event Campaign (7–1 days before)",
  countdown: "Countdown Sequence",
  day_of: "Day-Of Content",
  post_event: "Post-Event Follow-Up",
};

export const PROMOTION_PLATFORM_LABELS: Record<PromotionPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  sms: "SMS",
  email: "Email",
};
