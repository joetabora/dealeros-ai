import {
  EVENT_TYPES,
  type EventInput,
  type EventType,
} from "@/types/event";

const EVENT_TYPE_SET = new Set(EVENT_TYPES.map((item) => item.value));

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

export function parseEventInput(formData: FormData): EventInput {
  const eventName = String(formData.get("eventName") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "") as EventType;
  const description = String(formData.get("description") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();

  if (!eventName) {
    throw new Error("Event name is required.");
  }

  if (!EVENT_TYPE_SET.has(eventType)) {
    throw new Error("Select a valid event type.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  if (!eventDate || !isValidDate(eventDate)) {
    throw new Error("Select a valid event date.");
  }

  return {
    eventName,
    eventType,
    description,
    eventDate,
  };
}

export function getEventTypeLabel(value: EventType) {
  return EVENT_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatEventCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
