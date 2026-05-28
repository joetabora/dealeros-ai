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

export type DealershipEvent = {
  id: string;
  userId: string;
  dealershipName: string;
  eventName: string;
  eventType: EventType;
  description: string;
  eventDate: string;
  createdAt: string;
};

export type EventFormState = {
  error?: string;
  success?: boolean;
  event?: DealershipEvent;
};
