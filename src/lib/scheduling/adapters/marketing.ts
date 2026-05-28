import type { RawScheduleItem } from "@/lib/scheduling/constants";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaignInput,
} from "@/types/marketing";

const FACEBOOK_OFFSETS = [-7, -5, -3] as const;
const INSTAGRAM_OFFSETS = [-7, -3, -1] as const;

export function buildMarketingScheduleItems(
  outputs: FullMarketingCampaignOutput,
): RawScheduleItem[] {
  const items: RawScheduleItem[] = [];
  let sortOrder = 0;

  outputs.socialMedia.facebookPosts.forEach((content, index) => {
    items.push({
      daysOffset: FACEBOOK_OFFSETS[index] ?? -3,
      platform: "facebook",
      contentType: "post",
      content,
      sortOrder: sortOrder++,
    });
  });

  outputs.socialMedia.instagramCaptions.forEach((content, index) => {
    items.push({
      daysOffset: INSTAGRAM_OFFSETS[index] ?? -1,
      platform: "instagram",
      contentType: "post",
      content,
      sortOrder: sortOrder++,
    });
  });

  items.push({
    daysOffset: 0,
    platform: "sms",
    contentType: "announcement",
    content: outputs.sms.announcement,
    sortOrder: sortOrder++,
  });

  items.push({
    daysOffset: -3,
    platform: "sms",
    contentType: "reminder",
    content: outputs.sms.reminder,
    sortOrder: sortOrder++,
  });

  items.push({
    daysOffset: -1,
    platform: "sms",
    contentType: "reminder",
    content: outputs.sms.finalUrgency,
    sortOrder: sortOrder++,
  });

  items.push({
    daysOffset: -7,
    platform: "email",
    contentType: "announcement",
    content: `${outputs.email.subjectLines[0]}\n\n${outputs.email.body}\n\n${outputs.email.ctaSection}`,
    sortOrder: sortOrder++,
  });

  for (const timelineItem of outputs.timeline) {
    const daysOffset = parseTimelineOffset(timelineItem.timing);
    items.push({
      daysOffset,
      platform: mapTimelinePlatform(timelineItem.platform),
      contentType: inferTimelineContentType(timelineItem.label, timelineItem.platform),
      content: timelineItem.content,
      sortOrder: sortOrder++,
    });
  }

  items.push({
    daysOffset: 1,
    platform: "email",
    contentType: "follow_up",
    content: `${outputs.email.subjectLines[2]}\n\n${outputs.revenueLayer.serviceUpsell}\n\n${outputs.revenueLayer.salesCta}`,
    sortOrder: sortOrder++,
  });

  return dedupeScheduleItems(items);
}

export function resolveMarketingAnchorDate(input: MarketingCampaignInput) {
  return input.campaignDate ?? defaultAnchorFromNow();
}

function defaultAnchorFromNow() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseTimelineOffset(timing: string) {
  if (timing.startsWith("T-7")) return -7;
  if (timing.startsWith("T-3")) return -3;
  if (timing.startsWith("T-1")) return -1;
  if (timing.toLowerCase().includes("day-of")) return 0;
  if (timing.toLowerCase().includes("post-event")) return 1;
  return 0;
}

function mapTimelinePlatform(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("facebook")) return "facebook" as const;
  if (normalized.includes("instagram")) return "instagram" as const;
  if (normalized.includes("sms")) return "sms" as const;
  return "email" as const;
}

function inferTimelineContentType(
  label: string,
  platform: string,
): RawScheduleItem["contentType"] {
  const normalized = label.toLowerCase();
  if (normalized.includes("follow") || normalized.includes("reactivation")) {
    return "follow_up";
  }
  if (normalized.includes("reminder") || normalized.includes("urgency")) {
    return "reminder";
  }
  if (normalized.includes("hype") || normalized.includes("announce")) {
    return "announcement";
  }
  if (platform.toLowerCase() === "email") return "announcement";
  return "post";
}

function dedupeScheduleItems(items: RawScheduleItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.daysOffset}:${item.platform}:${item.content.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
