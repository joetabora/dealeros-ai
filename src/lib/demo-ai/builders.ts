import {
  AD_HEADLINE_PREFIX,
  applyHumanTexture,
  buildCta,
  buildHashtags,
  CTA_WITH_DEALER,
  EMAIL_FRAMES,
  EMAIL_OPENERS,
  EMAIL_SUBJECTS,
  EMOTIONAL_LINES,
  FACEBOOK_INTROS,
  getDetailsPool,
  injectDealerName,
  pickFromPool,
  QUESTION_HOOKS,
  SHORT_HYPE,
  SMS_URGENCY,
  truncate,
} from "@/lib/demo-ai/pools";
import { pickMemoryFacebookFormat } from "@/lib/demo-ai/memory-influence";
import type { DemoCampaignOutput, GenerationRuntime } from "@/lib/demo-ai/types";

function buildFacebookParts(runtime: GenerationRuntime): string[] {
  const format = pickMemoryFacebookFormat(runtime, runtime.memory);

  const details = pickFromPool(getDetailsPool(runtime.input.campaign_type), runtime);
  const cta = buildCta(runtime);

  switch (format) {
    case "hook-details-cta":
      return [
        pickFromPool(FACEBOOK_INTROS, runtime),
        details,
        cta,
      ];
    case "hook-emotional-details-cta":
      return [
        pickFromPool(FACEBOOK_INTROS, runtime),
        pickFromPool(EMOTIONAL_LINES, runtime),
        details,
        cta,
      ];
    case "question-hook-details-cta":
      return [
        pickFromPool(QUESTION_HOOKS, runtime),
        pickFromPool(FACEBOOK_INTROS, runtime),
        details,
        cta,
      ];
    case "short-hype":
      return [
        pickFromPool(SHORT_HYPE, runtime),
        details,
        cta,
      ];
  }
}

export function buildFacebookPost(runtime: GenerationRuntime): string {
  const parts = injectDealerName(
    buildFacebookParts(runtime),
    runtime.input.dealership_name,
    runtime.dealerPlacement,
    runtime.rng,
  );

  return parts
    .map((part) => applyHumanTexture(part, runtime))
    .join("\n\n");
}

export function buildInstagramCaption(runtime: GenerationRuntime): string {
  const { input, rng } = runtime;
  const structure = rng.pick([
    "story-cta-tags",
    "hook-details-cta-tags",
    "short-hype-tags",
  ] as const);

  let lines: string[];

  switch (structure) {
    case "story-cta-tags":
      lines = [
        pickFromPool(EMOTIONAL_LINES, runtime),
        pickFromPool(getDetailsPool(input.campaign_type), runtime),
        buildCta(runtime),
      ];
      break;
    case "hook-details-cta-tags":
      lines = [
        pickFromPool(FACEBOOK_INTROS, runtime),
        pickFromPool(getDetailsPool(input.campaign_type), runtime),
        buildCta(runtime, false),
      ];
      break;
    case "short-hype-tags":
      lines = [
        pickFromPool(SHORT_HYPE, runtime),
        buildCta(runtime),
      ];
      break;
  }

  lines = injectDealerName(
    lines,
    input.dealership_name,
    runtime.dealerPlacement,
    rng,
  );

  const caption = lines
    .map((line) => applyHumanTexture(line, runtime))
    .join("\n\n");

  return `${caption}\n\n${buildHashtags(input.dealership_name, input.campaign_type, rng)}`;
}

export function buildSmsMessage(runtime: GenerationRuntime): string {
  const { input, rng, context } = runtime;
  const urgency = rng.pick(SMS_URGENCY);
  const detail = pickFromPool(getDetailsPool(input.campaign_type), runtime)
    .replace(/[\n🔥🎉🏍️🎸🏁🛠️✅🔧👋⚡💥🏷️]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const shortDetail = detail.length > 90 ? `${detail.slice(0, 87).trim()}…` : detail;

  const structures = [
    `${input.dealership_name}: ${urgency} — ${shortDetail} See you here.`,
    `${input.dealership_name}: ${shortDetail} ${rng.pick(["Pull up.", "Stop in.", "Ride in."])}`,
    `${urgency} at ${input.dealership_name}. ${shortDetail}`,
    `${input.dealership_name} — ${shortDetail} ${rng.pick(CTA_WITH_DEALER(input.dealership_name))}`,
  ];

  let message = rng.pick(structures);

  if (context.urgencyLevel >= 4 && rng.chance(0.5)) {
    message = message.replace("this weekend", "this wknd");
  }

  return truncate(message.replace(/\s+/g, " ").trim(), 320);
}

export function buildEmailCampaign(runtime: GenerationRuntime): string {
  const { input, rng } = runtime;
  const subject = pickFromPool(EMAIL_SUBJECTS, runtime);
  const opener = rng.pick(EMAIL_OPENERS);
  const frame = rng.pick(EMAIL_FRAMES);
  const details = pickFromPool(getDetailsPool(input.campaign_type), runtime);
  const emotional =
    rng.chance(0.6) ? pickFromPool(EMOTIONAL_LINES, runtime) : null;
  const cta = buildCta(runtime);

  const bodyParts = injectDealerName(
    [
      frame,
      ...(emotional ? [emotional] : []),
      details,
      cta,
    ],
    input.dealership_name,
    runtime.dealerPlacement,
    rng,
  );

  const body = [
    opener,
    "",
    ...bodyParts.flatMap((part, index) =>
      index === 0 ? [applyHumanTexture(part, runtime)] : ["", applyHumanTexture(part, runtime)],
    ),
    "",
    rng.chance(0.5)
      ? `See you soon,\nThe team at ${input.dealership_name}`
      : `We'll see you at the showroom,\n— ${input.dealership_name}`,
  ].join("\n");

  return `Subject: ${subject}\n\n${body}`;
}

export function buildAdHeadline(runtime: GenerationRuntime): string {
  const { input, rng } = runtime;
  const prefix = rng.pick(AD_HEADLINE_PREFIX);
  const detail = pickFromPool(getDetailsPool(input.campaign_type), runtime)
    .split(".")[0]
    ?.trim();

  const options = [
    `${prefix} — ${input.dealership_name}`,
    `${input.dealership_name}: ${prefix}`,
    truncate(detail ?? prefix, 45),
    `${prefix} at ${input.dealership_name}`,
  ];

  return truncate(rng.pick(options), 60);
}

export function buildCtaSuggestions(runtime: GenerationRuntime): string[] {
  const dealer = runtime.input.dealership_name;
  return runtime.rng.pickMany(
    [
      ...CTA_WITH_DEALER(dealer),
      buildCta(runtime),
      buildCta(runtime, false),
      `Message ${dealer} to RSVP`,
      `Call ${dealer} for details`,
      `Tag a rider and meet at ${dealer}`,
    ],
    4,
  );
}

export function buildCampaignOutputs(runtime: GenerationRuntime): DemoCampaignOutput {
  return {
    facebook_post: buildFacebookPost(runtime),
    instagram_caption: buildInstagramCaption(runtime),
    sms_message: buildSmsMessage(runtime),
    email_campaign: buildEmailCampaign(runtime),
    ad_headline: buildAdHeadline(runtime),
    cta_suggestions: buildCtaSuggestions(runtime),
  };
}
