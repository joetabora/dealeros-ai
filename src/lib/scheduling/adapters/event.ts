import type { RawScheduleItem } from "@/lib/scheduling/constants";
import {
  inferContentType,
  mapPlatformLabel,
} from "@/lib/scheduling/timing-engine";
import type { DealershipEvent, EventPromotionPack } from "@/types/event";

const PHASE_OFFSETS: Record<string, number> = {
  pre_event: -7,
  countdown: -3,
  day_of: 0,
  post_event: 1,
};

export function buildEventScheduleItems(
  pack: EventPromotionPack,
): RawScheduleItem[] {
  return pack.items.map((item, index) => {
    const daysOffset =
      item.id.includes("3-day") ? -3
      : item.id.includes("1-day") || item.id.includes("tomorrow") ? -1
      : item.id.includes("day-morning") || item.id.includes("day-mid") || item.id.includes("day-urgency") ? 0
      : item.phase === "post_event" ? 1
      : PHASE_OFFSETS[item.phase] ?? -7;

    const platform = mapPlatformLabel(item.platform);

    return {
      daysOffset,
      platform,
      contentType: inferContentType(item.label, platform),
      content: item.content,
      sortOrder: index,
    };
  });
}

export function resolveEventAnchorDate(event: DealershipEvent) {
  return event.eventDate;
}
