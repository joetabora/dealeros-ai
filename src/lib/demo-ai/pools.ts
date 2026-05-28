import type { DemoCampaignType, GenerationRuntime, SeededRandom } from "@/lib/demo-ai/types";
import { applyMemoryToCtaChance } from "@/lib/demo-ai/memory-influence";

type PoolBuilder = (runtime: GenerationRuntime) => string;

const FACEBOOK_INTROS: PoolBuilder[] = [
  ({ input, rng }) =>
    `${maybeEmoji(["🔥", "🏍️"], rng, 2)} Big news at ${input.dealership_name}…`,
  ({ input }) => `Riders — this one's for you at ${input.dealership_name}.`,
  ({ input }) => `You don't want to miss this at ${input.dealership_name}.`,
  ({ input }) =>
    `Something big is happening at ${input.dealership_name} this week.`,
  ({ input, context }) =>
    `${input.dealership_name} is bringing the energy — built for ${context.audienceTypeModifier}.`,
  ({ input, rng }) =>
    `${maybeEmoji(["🎸", "🎉"], rng, 2)} All eyes on ${input.dealership_name} this weekend.`,
];

const QUESTION_HOOKS: PoolBuilder[] = [
  ({ input, context }) =>
    `Ready for a real dealership weekend? ${input.dealership_name} has something worth the ride.`,
  ({ input }) =>
    `When's the last time a showroom actually felt alive? Pull up to ${input.dealership_name}.`,
  ({ context, input }) =>
    `Looking for a reason to ride in? ${input.dealership_name} just gave ${context.audienceTypeModifier} one.`,
];

const EVENT_DETAILS: PoolBuilder[] = [
  ({ input, context }) =>
    `We're talking test rides, live energy, and the kind of crowd ${context.audienceTypeModifier} actually show up for — all under the ${input.dealership_name} roof.`,
  ({ input, context, rng }) =>
    rng.chance(0.5)
      ? `Food, music, bikes on display, and deals that only make sense in person at ${input.dealership_name}.`
      : `Doors open wide for ${context.audienceTypeModifier}. The lot's packed, the crew's ready, and ${input.dealership_name} is doing what it does best.`,
  ({ input }) =>
    `This isn't a generic promo. It's a full-on ${input.dealership_name} experience — built for people who ride, not just browse.`,
];

const SERVICE_DETAILS: PoolBuilder[] = [
  ({ input, context }) =>
    `Seasonal checkups, tire work, and full inspections — ${input.dealership_name} is booking ${context.audienceTypeModifier} before bays fill up.`,
  ({ input }) =>
    `Factory-trained techs. Honest recommendations. Fast turnaround. That's how service works at ${input.dealership_name}.`,
  ({ input, context }) =>
    `Your bike's been good to you. ${input.dealership_name} helps ${context.audienceTypeModifier} return the favor.`,
];

const REACTIVATION_DETAILS: PoolBuilder[] = [
  ({ input, context }) =>
    `We've been thinking about ${context.audienceTypeModifier} — and ${input.dealership_name} put together a comeback offer that feels personal, not pushy.`,
  ({ input }) =>
    `It's been a minute. ${input.dealership_name} kept something on the table for riders ready to roll back in.`,
  ({ input, context, rng }) =>
    rng.chance(0.5)
      ? `No guilt trip. Just a real reason to reconnect with ${input.dealership_name}.`
      : `${input.dealership_name} misses the regulars — especially ${context.audienceTypeModifier}.`,
];

const SEASONAL_DETAILS: PoolBuilder[] = [
  ({ input, context }) =>
    `Select models. Aggressive numbers. Limited windows. ${input.dealership_name} is moving inventory while ${context.audienceTypeModifier} can still get first pick.`,
  ({ input }) =>
    `If you've been waiting on the right deal, ${input.dealership_name} just flipped the calendar — and the pricing.`,
  ({ input, context }) =>
    `Same-day delivery. Low APR talk. Real numbers on the floor. ${input.dealership_name} built this push for ${context.audienceTypeModifier} who are done waiting.`,
];

const EMOTIONAL_LINES: PoolBuilder[] = [
  ({ context }) =>
    `There's a difference between a sale and a scene — and right now the vibe is ${context.emotionalTone}.`,
  ({ input, context }) =>
    `${input.dealership_name} isn't trying to sound like a corporate ad. This is for ${context.audienceTypeModifier}.`,
  ({ context }) =>
    `You know that feeling when the lot's buzzing? That's what we're going for — ${context.emotionalTone}.`,
];

const SHORT_HYPE: PoolBuilder[] = [
  ({ input, rng, context }) =>
    `${maybeEmoji(["🔥", "⚡"], rng, 1)} ${input.dealership_name}. This weekend. Be there.`,
  ({ input, context }) =>
    `Big energy at ${input.dealership_name}. Built for ${context.audienceTypeModifier}.`,
  ({ input, rng }) =>
    `${input.dealership_name} is open. The deals are live. ${maybeEmoji(["🏍️"], rng, 1)}`.trim(),
];

export const CTA_PHRASES = [
  "Stop in today",
  "Don't miss it",
  "See you there",
  "Join us this weekend",
  "Ride in and check it out",
  "Grab your spot",
  "Roll through this week",
  "Call the showroom",
  "Pull up — you won't regret it",
  "Let's make it happen",
];

export const CTA_WITH_DEALER = (dealer: string) => [
  `Stop in at ${dealer} today`,
  `See you at ${dealer} this weekend`,
  `Ride into ${dealer} and check it out`,
  `${dealer} — don't miss it`,
  `Join us at ${dealer}`,
];

export const EMAIL_OPENERS = [
  "Hey there,",
  "What's up,",
  "Quick note for you,",
  "Hope you're doing well,",
];

export const EMAIL_FRAMES = [
  "We've been planning something big…",
  "This weekend we're bringing the community together…",
  "We've got a window opening up and wanted you to hear it first…",
  "The showroom's been buzzing, and we wanted to loop you in…",
  "If you've been waiting for the right moment, this might be it…",
];

const EMAIL_SUBJECTS: PoolBuilder[] = [
  ({ input }) => `You're Invited — ${input.dealership_name}`,
  ({ input, context }) =>
    `${input.dealership_name} has something for ${context.audienceTypeModifier}`,
  ({ input }) => `This week at ${input.dealership_name}`,
  ({ input, context }) =>
    `Don't miss this — ${input.dealership_name}`,
  ({ input }) => `Quick heads-up from ${input.dealership_name}`,
];

export const SMS_URGENCY = [
  "Don't miss this",
  "Happening now",
  "This weekend only",
  "Limited window",
  "Heads up",
  "Quick one",
];

export const AD_HEADLINE_PREFIX = [
  "Ride in today",
  "Weekend alert",
  "Local favorite",
  "Limited time",
  "Just dropped",
  "Showroom live",
];

export function maybeEmoji(
  options: string[],
  rng: SeededRandom,
  maxCount: number,
): string {
  const count = rng.int(0, maxCount);
  if (count === 0) return "";

  return rng.pickMany(options, Math.min(count, options.length)).join("");
}

export function pickFromPool(
  pool: PoolBuilder[],
  runtime: GenerationRuntime,
): string {
  return runtime.rng.pick(pool)(runtime);
}

export function getDetailsPool(campaignType: DemoCampaignType): PoolBuilder[] {
  switch (campaignType) {
    case "event":
      return EVENT_DETAILS;
    case "service":
      return SERVICE_DETAILS;
    case "reactivation":
      return REACTIVATION_DETAILS;
    case "seasonal_sale":
      return SEASONAL_DETAILS;
  }
}

export function buildCta(runtime: GenerationRuntime, includeDealer = true): string {
  const { input, rng, context } = runtime;
  const phrase = rng.pick(CTA_PHRASES);
  const dealerCta = rng.pick(CTA_WITH_DEALER(input.dealership_name));

  if (!includeDealer) {
    return phrase;
  }

  return rng.chance(
    applyMemoryToCtaChance(
      context.urgencyLevel >= 4 ? 0.65 : 0.4,
      runtime.memory,
    ),
  )
    ? dealerCta
    : `${phrase} — ${input.dealership_name}`;
}

export function applyHumanTexture(
  text: string,
  runtime: GenerationRuntime,
): string {
  const { rng, context, useRhetoricalQuestion } = runtime;
  let result = text;

  if (useRhetoricalQuestion && rng.chance(0.35)) {
    const questions = ["You in?", "Sound familiar?", "Ready to roll?", "Why wait?"];
    result = `${result} ${rng.pick(questions)}`;
  }

  if (context.hypeLevel >= 4 && rng.chance(0.4)) {
    result = result.replace(/\.$/, "!");
  }

  if (context.professionalismLevel >= 4 && rng.chance(0.5)) {
    result = result.replace(/!/g, ".");
  }

  if (rng.chance(0.3)) {
    result = result.replace(" — ", rng.pick([" - ", " — ", ". "]));
  }

  return result.trim();
}

export function injectDealerName(
  parts: string[],
  dealer: string,
  placement: GenerationRuntime["dealerPlacement"],
  rng: SeededRandom,
): string[] {
  const withDealer = [...parts];

  if (placement === "hook" && !withDealer[0]?.includes(dealer)) {
    withDealer[0] = `${dealer} — ${withDealer[0]}`;
  }

  if (placement === "mid") {
    const midIndex = Math.max(1, Math.floor(withDealer.length / 2));
    if (!withDealer[midIndex]?.includes(dealer)) {
      withDealer[midIndex] = `${withDealer[midIndex]} (${dealer})`;
    }
  }

  if (placement === "close") {
    withDealer.push(`See you at ${dealer}.`);
  }

  if (rng.chance(0.2) && placement !== "close") {
    withDealer.push(`— ${dealer}`);
  }

  return withDealer;
}

export function buildHashtags(
  dealer: string,
  campaignType: DemoCampaignType,
  rng: SeededRandom,
): string {
  const slug = dealer.replace(/[^a-zA-Z0-9]/g, "");
  const tags = [
    `#${slug}`,
    rng.pick(["#RideLocal", "#HarleyLife", "#BikeCulture", "#OpenRoad"]),
    rng.pick([
      "#DealershipEvents",
      "#TwoWheels",
      "#MotorcycleCommunity",
      "#RideOut",
    ]),
  ];

  if (campaignType === "event") tags.push("#WeekendEvent");
  if (campaignType === "service") tags.push("#ServiceSeason");
  if (campaignType === "reactivation") tags.push("#WelcomeBack");
  if (campaignType === "seasonal_sale") tags.push("#LimitedTime");

  return tags.slice(0, 4).join(" ");
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export {
  FACEBOOK_INTROS,
  QUESTION_HOOKS,
  EMOTIONAL_LINES,
  SHORT_HYPE,
  EMAIL_SUBJECTS,
};

export type { PoolBuilder };
