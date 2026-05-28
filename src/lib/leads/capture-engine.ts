import { syncLeadMemory } from "@/lib/leads/memory";
import { insertLead } from "@/lib/leads/repository";
import type {
  IntentLevel,
  LeadCaptureInput,
  LeadInterestType,
  LeadSource,
} from "@/types/leads";
import type { ScheduledMarketingAction } from "@/types/scheduling";

const SMS_KEYWORDS = new Set(["YES", "INFO", "BOOK"]);

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function inferInterestFromContent(
  content: string,
  fallback: LeadInterestType = "general",
): LeadInterestType {
  const normalized = content.toLowerCase();
  if (/service|maintenance|bay|oil change|repair/.test(normalized)) return "service";
  if (/sale|financ|inventory|deal|test ride|buy/.test(normalized)) return "sales";
  if (/event|rsvp|bike night|attend|show/.test(normalized)) return "event";
  return fallback;
}

function inferIntentLevel({
  source,
  engagementType,
}: {
  source: LeadSource;
  engagementType?: string;
}): IntentLevel {
  if (source === "sms" && engagementType && SMS_KEYWORDS.has(engagementType.toUpperCase())) {
    return engagementType.toUpperCase() === "BOOK" ? "high" : "medium";
  }
  if (source === "email" && engagementType === "reply") return "high";
  if (source === "event" && engagementType === "rsvp") return "high";
  if (source === "sms") return "medium";
  return "low";
}

function buildSimulatedContact(source: LeadSource, seed: number) {
  const names = ["Alex Rivera", "Jordan Smith", "Taylor Brooks", "Casey Nguyen", "Morgan Lee"];
  const name = names[seed % names.length]!;

  if (source === "email") {
    return {
      name,
      email: `${name.split(" ")[0]?.toLowerCase()}@example.com`,
      phone: null,
    };
  }

  return {
    name,
    phone: `+1555555${String(1000 + (seed % 9000)).padStart(4, "0")}`,
    email: null,
  };
}

export async function captureLead(input: LeadCaptureInput) {
  const interestType = input.interestType ?? "general";

  const lead = await insertLead({
    ...input,
    interestType,
  });

  await syncLeadMemory({
    userId: input.userId,
    dealershipName: input.dealershipName,
    lead,
    intentLevel: input.intentLevel ?? inferIntentLevel(input),
  });

  return lead;
}

export async function captureLeadFromExecution({
  userId,
  action,
  simulate = true,
}: {
  userId: string;
  action: ScheduledMarketingAction;
  simulate?: boolean;
}) {
  if (!simulate) return null;

  const seed = hashString(action.id);
  const captureRate =
    action.platform === "sms" ? 0.38 : action.platform === "email" ? 0.22 : 0.18;

  if (seed % 100 > captureRate * 100) {
    return null;
  }

  const engagementType =
    action.platform === "sms"
      ? ["YES", "INFO", "BOOK"][seed % 3]
      : action.platform === "email"
        ? seed % 2 === 0
          ? "click"
          : "reply"
        : "cta_click";

  const contact = buildSimulatedContact(
    action.platform === "instagram" ? "instagram" : action.platform,
    seed,
  );

  return captureLead({
    userId,
    dealershipName: action.dealershipName,
    campaignId: action.campaignId,
    eventId: action.eventId,
    source:
      action.platform === "instagram"
        ? "instagram"
        : (action.platform as LeadSource),
    interestType: inferInterestFromContent(action.content),
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    engagementType,
    intentLevel: inferIntentLevel({
      source: action.platform as LeadSource,
      engagementType,
    }),
  });
}

export async function simulateSmsResponseLead({
  userId,
  dealershipName,
  keyword,
  campaignId,
  eventId,
}: {
  userId: string;
  dealershipName: string;
  keyword: string;
  campaignId?: string | null;
  eventId?: string | null;
}) {
  const normalized = keyword.toUpperCase();
  if (!SMS_KEYWORDS.has(normalized)) {
    throw new Error("Use YES, INFO, or BOOK to simulate an SMS response.");
  }

  const seed = hashString(`${dealershipName}:${keyword}:${campaignId ?? "none"}`);
  const contact = buildSimulatedContact("sms", seed);

  return captureLead({
    userId,
    dealershipName,
    campaignId,
    eventId,
    source: "sms",
    interestType: normalized === "BOOK" ? "service" : "event",
    name: contact.name,
    phone: contact.phone,
    engagementType: normalized,
    intentLevel: inferIntentLevel({ source: "sms", engagementType: normalized }),
  });
}

export async function simulateEventRsvpLead({
  userId,
  dealershipName,
  eventId,
  campaignId,
}: {
  userId: string;
  dealershipName: string;
  eventId: string;
  campaignId?: string | null;
}) {
  const seed = hashString(`${eventId}:rsvp`);
  const contact = buildSimulatedContact("event", seed);

  return captureLead({
    userId,
    dealershipName,
    campaignId,
    eventId,
    source: "event",
    interestType: "event",
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    engagementType: "rsvp",
    intentLevel: "high",
  });
}

export async function simulateEmailEngagementLead({
  userId,
  dealershipName,
  campaignId,
  engagementType = "click",
}: {
  userId: string;
  dealershipName: string;
  campaignId?: string | null;
  engagementType?: "click" | "reply";
}) {
  const seed = hashString(`${campaignId ?? "email"}:${engagementType}`);
  const contact = buildSimulatedContact("email", seed);

  return captureLead({
    userId,
    dealershipName,
    campaignId,
    source: "email",
    interestType: "sales",
    name: contact.name,
    email: contact.email,
    engagementType,
    intentLevel: engagementType === "reply" ? "high" : "medium",
  });
}
