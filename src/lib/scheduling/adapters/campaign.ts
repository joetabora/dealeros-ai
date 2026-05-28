import type { RawScheduleItem } from "@/lib/scheduling/constants";
import { defaultAnchorDate } from "@/lib/scheduling/constants";
import type { CampaignGeneratorOutputs } from "@/types/campaign";

export function buildCampaignScheduleItems(
  outputs: CampaignGeneratorOutputs,
): RawScheduleItem[] {
  let sortOrder = 0;

  return [
    {
      daysOffset: -7,
      platform: "facebook",
      contentType: "post",
      content: outputs.facebookPost,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: -5,
      platform: "instagram",
      contentType: "post",
      content: outputs.instagramCaption,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: -3,
      platform: "facebook",
      contentType: "reminder",
      content: outputs.adHeadline,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: -1,
      platform: "sms",
      contentType: "reminder",
      content: outputs.smsMessage,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: 0,
      platform: "instagram",
      contentType: "post",
      content: `${outputs.instagramCaption}\n\n${outputs.callToActionSuggestions.join("\n")}`,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: -7,
      platform: "email",
      contentType: "announcement",
      content: outputs.emailCampaign,
      sortOrder: sortOrder++,
    },
    {
      daysOffset: 1,
      platform: "email",
      contentType: "follow_up",
      content: `${outputs.callToActionSuggestions.join("\n")}\n\n${outputs.smsMessage}`,
      sortOrder: sortOrder++,
    },
  ];
}

export function resolveCampaignAnchorDate() {
  return defaultAnchorDate(14);
}
