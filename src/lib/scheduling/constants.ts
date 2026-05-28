import type { ScheduledContentType, ScheduledPlatform } from "@/types/scheduling";

export const DEFAULT_DEALERSHIP_TIMEZONE = "America/Chicago";

/** Deterministic local post hours per platform (24h). Max 2 slots for social. */
export const PLATFORM_POST_HOURS: Record<ScheduledPlatform, number[]> = {
  facebook: [10, 18],
  instagram: [12, 17],
  sms: [11],
  email: [9],
};

/** SMS only on high-urgency offsets. */
export const SMS_ALLOWED_OFFSETS = new Set([-3, -1, 0]);

/** Minimum day gap between email sends. */
export const EMAIL_MIN_DAY_GAP = 5;

export type RawScheduleItem = {
  daysOffset: number;
  platform: ScheduledPlatform;
  contentType: ScheduledContentType;
  content: string;
  sortOrder: number;
};

export type ScheduleContext = {
  anchorDate: string;
  timezone?: string;
  dealershipName: string;
  campaignId?: string | null;
  eventId?: string | null;
};

export function defaultAnchorDate(daysFromNow = 14) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return formatDateKey(date);
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function resolveScheduledTimestamp(
  anchorDate: string,
  daysOffset: number,
  hour: number,
  timezone = DEFAULT_DEALERSHIP_TIMEZONE,
) {
  const dateKey = addDaysToDateKey(anchorDate, daysOffset);
  const hourString = String(hour).padStart(2, "0");

  const utcGuess = new Date(`${dateKey}T${hourString}:00:00`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(utcGuess);
  const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value;
  const offset = offsetPart?.replace("GMT", "") ?? "-06:00";

  return `${dateKey}T${hourString}:00:00${offset}`;
}

export function formatScheduledDisplay(
  iso: string,
  timezone = DEFAULT_DEALERSHIP_TIMEZONE,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatGroupDateLabel(
  dateKey: string,
  timezone = DEFAULT_DEALERSHIP_TIMEZONE,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}
