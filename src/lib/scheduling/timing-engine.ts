import {
  EMAIL_MIN_DAY_GAP,
  PLATFORM_POST_HOURS,
  SMS_ALLOWED_OFFSETS,
  addDaysToDateKey,
  resolveScheduledTimestamp,
  type RawScheduleItem,
  type ScheduleContext,
  DEFAULT_DEALERSHIP_TIMEZONE,
} from "@/lib/scheduling/constants";
import type {
  ScheduledContentType,
  ScheduledMarketingAction,
  ScheduledPlatform,
} from "@/types/scheduling";

type ResolvedInsert = {
  dealershipName: string;
  campaignId: string | null;
  eventId: string | null;
  platform: ScheduledPlatform;
  contentType: ScheduledContentType;
  content: string;
  scheduledFor: string;
  status: "pending";
};

function shouldSkipSms(daysOffset: number) {
  return !SMS_ALLOWED_OFFSETS.has(daysOffset);
}

function pickHour(platform: ScheduledPlatform, slotIndex: number) {
  const hours = PLATFORM_POST_HOURS[platform];
  return hours[Math.min(slotIndex, hours.length - 1)]!;
}

export function assignScheduleTimestamps(
  items: RawScheduleItem[],
  context: ScheduleContext,
): ResolvedInsert[] {
  const timezone = context.timezone ?? DEFAULT_DEALERSHIP_TIMEZONE;
  const platformDaySlots = new Map<string, number>();
  const emailDates: string[] = [];

  const sorted = [...items].sort(
    (left, right) =>
      left.daysOffset - right.daysOffset || left.sortOrder - right.sortOrder,
  );

  const resolved: ResolvedInsert[] = [];

  for (const item of sorted) {
    if (item.platform === "sms" && shouldSkipSms(item.daysOffset)) {
      continue;
    }

    const dateKey = addDaysToDateKey(context.anchorDate, item.daysOffset);

    if (item.platform === "email") {
      const tooSoon = emailDates.some((existingDate) => {
        const existing = new Date(`${existingDate}T12:00:00`);
        const current = new Date(`${dateKey}T12:00:00`);
        const diffDays = Math.abs(
          (current.getTime() - existing.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays < EMAIL_MIN_DAY_GAP;
      });

      if (tooSoon) {
        continue;
      }

      emailDates.push(dateKey);
    }

    const dayPlatformKey = `${dateKey}:${item.platform}`;
    const slotIndex = platformDaySlots.get(dayPlatformKey) ?? 0;

    if (
      (item.platform === "facebook" || item.platform === "instagram") &&
      slotIndex >= 2
    ) {
      continue;
    }

    platformDaySlots.set(dayPlatformKey, slotIndex + 1);

    const hour = pickHour(item.platform, slotIndex);
    const scheduledFor = resolveScheduledTimestamp(
      context.anchorDate,
      item.daysOffset,
      hour,
      timezone,
    );

    resolved.push({
      dealershipName: context.dealershipName,
      campaignId: context.campaignId ?? null,
      eventId: context.eventId ?? null,
      platform: item.platform,
      contentType: item.contentType,
      content: item.content,
      scheduledFor,
      status: "pending",
    });
  }

  return resolved;
}

export function groupActionsByDate(
  actions: ScheduledMarketingAction[],
  timezone = DEFAULT_DEALERSHIP_TIMEZONE,
) {
  const groups = new Map<string, ScheduledMarketingAction[]>();

  for (const action of actions) {
    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(action.scheduledFor));

    const bucket = groups.get(dateKey) ?? [];
    bucket.push(action);
    groups.set(dateKey, bucket);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, bucketActions]) => ({
      dateKey,
      dateLabel: new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${dateKey}T12:00:00`)),
      actions: bucketActions.sort((left, right) =>
        left.scheduledFor.localeCompare(right.scheduledFor),
      ),
    }));
}

export function inferContentType(
  label: string,
  platform: ScheduledPlatform,
): ScheduledContentType {
  const normalized = label.toLowerCase();

  if (normalized.includes("follow") || normalized.includes("thank")) {
    return "follow_up";
  }

  if (normalized.includes("reminder") || normalized.includes("urgency")) {
    return "reminder";
  }

  if (
    normalized.includes("announcement") ||
    normalized.includes("invitation") ||
    platform === "email"
  ) {
    return "announcement";
  }

  return "post";
}

export function mapPlatformLabel(platform: string): ScheduledPlatform {
  const normalized = platform.toLowerCase();
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("sms")) return "sms";
  return "email";
}
