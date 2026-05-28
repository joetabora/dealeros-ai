export type DemoCampaignType =
  | "event"
  | "service"
  | "reactivation"
  | "seasonal_sale";

export type DemoCampaignTone =
  | "energetic"
  | "premium"
  | "community"
  | "aggressive_sales";

export type DemoCampaignPlatform =
  | "facebook"
  | "instagram"
  | "sms"
  | "email";

export type DemoCampaignInput = {
  dealership_name: string;
  campaign_type: DemoCampaignType;
  target_audience: string;
  tone: DemoCampaignTone;
  platform: DemoCampaignPlatform;
};

export type DemoCampaignOutput = {
  facebook_post: string;
  instagram_caption: string;
  sms_message: string;
  email_campaign: string;
  ad_headline: string;
  cta_suggestions: string[];
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickMany<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const selected: T[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]!);
  }

  return selected;
}

function maybeEmoji(options: string[], tone: DemoCampaignTone): string {
  if (tone === "premium") {
    return Math.random() > 0.7 ? pick(options) : "";
  }

  return Math.random() > 0.25 ? pick(options) : "";
}

type ToneStyle = {
  opener: string;
  energy: string;
  punctuation: string;
  ctaPrefix: string;
};

const TONE_STYLES: Record<DemoCampaignTone, ToneStyle> = {
  energetic: {
    opener: "Let's go",
    energy: "high-energy",
    punctuation: "!",
    ctaPrefix: "Don't wait",
  },
  premium: {
    opener: "Experience",
    energy: "refined",
    punctuation: ".",
    ctaPrefix: "Reserve",
  },
  community: {
    opener: "Hey riders",
    energy: "welcoming",
    punctuation: ".",
    ctaPrefix: "Join us",
  },
  aggressive_sales: {
    opener: "Last chance",
    energy: "urgent",
    punctuation: "!",
    ctaPrefix: "Act now",
  },
};

type CampaignBlueprint = {
  hook: (dealer: string, audience: string) => string;
  body: (dealer: string, audience: string) => string;
  offer: (dealer: string) => string;
  headline: (dealer: string) => string;
  ctas: (dealer: string) => string[];
};

const CAMPAIGN_BLUEPRINTS: Record<DemoCampaignType, CampaignBlueprint> = {
  event: {
    hook: (dealer, audience) =>
      pick([
        `${maybeEmoji(["🔥", "🏍️", "🎸"], "energetic")} Big weekend at ${dealer}!`,
        `${maybeEmoji(["🎉", "🔥"], "energetic")} ${dealer} is opening the lot for an all-day rider event built for ${audience}.`,
        `${maybeEmoji(["🏁", "🔥"], "energetic")} This Saturday hits different at ${dealer} — live music, food, and the bikes you've been eyeing.`,
      ]),
    body: (dealer, audience) =>
      pick([
        `We're rolling out the welcome mat for ${audience} with test rides, exclusive event pricing, and the kind of energy you only get when ${dealer} throws a party on the showroom floor.`,
        `From open to close, ${dealer} is packed with demos, giveaways, and crew ready to get ${audience} back on two wheels.`,
        `Bring your crew, grab a seat, and see why ${dealer} is the home base for riders who actually show up.`,
      ]),
    offer: (dealer) =>
      pick([
        `Event-only specials are live all weekend at ${dealer}.`,
        `Limited inventory deals unlock when doors open at ${dealer}.`,
        `RSVP at ${dealer} and skip the line when you arrive.`,
      ]),
    headline: (dealer) =>
      pick([
        `${dealer} Weekend Event`,
        `Ride In. Roll Out. ${dealer}`,
        `Big Event at ${dealer}`,
      ]),
    ctas: (dealer) => [
      `RSVP at ${dealer}`,
      `Save your spot at ${dealer}`,
      `See the event lineup at ${dealer}`,
      `Roll through ${dealer} this weekend`,
      `Claim event perks at ${dealer}`,
    ],
  },
  service: {
    hook: (dealer, audience) =>
      pick([
        `${maybeEmoji(["🛠️", "✅"], "community")} ${dealer} service bays are open for ${audience}.`,
        `${maybeEmoji(["🔧"], "premium")} Keep your ride dialed in with ${dealer} service.`,
        `Your bike deserves better than "maybe later" — schedule service at ${dealer}.`,
      ]),
    body: (dealer, audience) =>
      pick([
        `${dealer} factory-trained techs are booking ${audience} for seasonal checkups, tire swaps, and full inspections that keep you safe on every mile.`,
        `Beat the rush before weather shifts — ${dealer} has priority appointments ready for ${audience}.`,
        `Trust the team at ${dealer} for honest recommendations, fast turnaround, and service that feels like talking to someone who actually rides.`,
      ]),
    offer: (dealer) =>
      pick([
        `Book this month at ${dealer} and ask about our seasonal service package.`,
        `Schedule online with ${dealer} and get a free multi-point inspection.`,
        `Limited appointment windows are open at ${dealer} — grab yours now.`,
      ]),
    headline: (dealer) =>
      pick([
        `Service Specials at ${dealer}`,
        `Book Service at ${dealer}`,
        `${dealer} Seasonal Checkup`,
      ]),
    ctas: (dealer) => [
      `Book service at ${dealer}`,
      `Schedule at ${dealer} today`,
      `Reserve your bay at ${dealer}`,
      `Call ${dealer} to book`,
      `Get on the calendar at ${dealer}`,
    ],
  },
  reactivation: {
    hook: (dealer, audience) =>
      pick([
        `${maybeEmoji(["👋", "🏍️"], "community")} We miss you at ${dealer}.`,
        `${maybeEmoji(["🔥"], "energetic")} ${dealer} saved something special for ${audience}.`,
        `It's been too long — ${dealer} wants you back in the saddle.`,
      ]),
    body: (dealer, audience) =>
      pick([
        `If you're part of ${audience}, ${dealer} built a comeback offer with trade-in boosts, loyalty perks, and flexible financing to make returning easy.`,
        `${dealer} kept your spot warm. Stop in, say hey, and see what's new on the floor.`,
        `We noticed you haven't rolled through ${dealer} in a while — let's fix that with an offer worth the ride in.`,
      ]),
    offer: (dealer) =>
      pick([
        `Exclusive win-back pricing is live now at ${dealer}.`,
        `Limited-time reactivation incentives are available at ${dealer} this week only.`,
        `Ask about your personalized comeback offer at ${dealer}.`,
      ]),
    headline: (dealer) =>
      pick([
        `Come Back to ${dealer}`,
        `${dealer} Misses You`,
        `Your Offer at ${dealer}`,
      ]),
    ctas: (dealer) => [
      `Claim your offer at ${dealer}`,
      `Reconnect with ${dealer}`,
      `Stop by ${dealer} this week`,
      `Redeem at ${dealer}`,
      `Book your visit to ${dealer}`,
    ],
  },
  seasonal_sale: {
    hook: (dealer, audience) =>
      pick([
        `${maybeEmoji(["⚡", "🔥", "💥"], "aggressive_sales")} Limited-time deals are live at ${dealer}.`,
        `${maybeEmoji(["🏷️"], "energetic")} ${dealer} just dropped seasonal pricing for ${audience}.`,
        `The clock is running at ${dealer} — inventory won't sit long.`,
      ]),
    body: (dealer, audience) =>
      pick([
        `${dealer} is moving select models with aggressive financing, bonus accessories, and offers built for ${audience} who are ready to buy now.`,
        `If you've been waiting on the right number, ${dealer} made this the week to pull the trigger.`,
        `Seasonal markdowns, low APR options, and same-day delivery are all on the table at ${dealer}.`,
      ]),
    offer: (dealer) =>
      pick([
        `Offers end soon at ${dealer} — once they're gone, they're gone.`,
        `Only a handful of units qualify at ${dealer} this week.`,
        `Lock in seasonal pricing at ${dealer} before the calendar flips.`,
      ]),
    headline: (dealer) =>
      pick([
        `Seasonal Sale at ${dealer}`,
        `Limited Deals — ${dealer}`,
        `${dealer} Sale Ends Soon`,
      ]),
    ctas: (dealer) => [
      `Shop deals at ${dealer}`,
      `Claim seasonal pricing at ${dealer}`,
      `Visit ${dealer} before offers expire`,
      `Get approved at ${dealer}`,
      `Save big at ${dealer} today`,
    ],
  },
};

function applyTone(text: string, tone: DemoCampaignTone, style: ToneStyle): string {
  if (tone === "energetic") {
    return text.replace(/\.$/, "!");
  }

  if (tone === "premium") {
    return text.replace(/!/g, ".").replace(/🔥|🎉|💥|⚡/g, "");
  }

  if (tone === "aggressive_sales") {
    return `${text} ${style.ctaPrefix} — inventory is moving fast.`;
  }

  if (tone === "community") {
    return text.includes("riders") ? text : `${text} Your ${style.energy} crew at the dealership is ready.`;
  }

  return text;
}

function buildHashtags(dealer: string, campaignType: DemoCampaignType): string {
  const slug = dealer.replace(/[^a-zA-Z0-9]/g, "");
  const tags = [
    `#${slug}`,
    pick(["#RideLocal", "#HarleyLife", "#BikeCulture", "#OpenRoad"]),
    pick(["#DealershipEvents", "#TwoWheels", "#MotorcycleCommunity", "#RideOut"]),
  ];

  if (campaignType === "event") tags.push("#WeekendEvent");
  if (campaignType === "service") tags.push("#ServiceSeason");
  if (campaignType === "reactivation") tags.push("#WelcomeBack");
  if (campaignType === "seasonal_sale") tags.push("#LimitedTime");

  return tags.slice(0, 4).join(" ");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildFacebookPost(
  input: DemoCampaignInput,
  blueprint: CampaignBlueprint,
  style: ToneStyle,
): string {
  const paragraphs = [
    applyTone(blueprint.hook(input.dealership_name, input.target_audience), input.tone, style),
    applyTone(blueprint.body(input.dealership_name, input.target_audience), input.tone, style),
    applyTone(blueprint.offer(input.dealership_name), input.tone, style),
    `${style.ctaPrefix} — message ${input.dealership_name} or stop in today${style.punctuation}`,
  ];

  return paragraphs.join("\n\n");
}

function buildInstagramCaption(
  input: DemoCampaignInput,
  blueprint: CampaignBlueprint,
  style: ToneStyle,
): string {
  const lines = [
    applyTone(blueprint.hook(input.dealership_name, input.target_audience), input.tone, style),
    applyTone(blueprint.body(input.dealership_name, input.target_audience), input.tone, style),
    `${style.ctaPrefix} at ${input.dealership_name}${style.punctuation}`,
    buildHashtags(input.dealership_name, input.campaign_type),
  ];

  return lines.join("\n\n");
}

function buildSmsMessage(
  input: DemoCampaignInput,
  blueprint: CampaignBlueprint,
  style: ToneStyle,
): string {
  const message = `${input.dealership_name}: ${applyTone(
    blueprint.hook(input.dealership_name, input.target_audience).replace(/[\n🔥🎉🏍️🎸🏁🛠️✅🔧👋⚡💥🏷️]/g, ""),
    input.tone,
    style,
  )} ${pick(blueprint.ctas(input.dealership_name))}${style.punctuation}`;

  return truncate(message.replace(/\s+/g, " ").trim(), 320);
}

function buildEmailCampaign(
  input: DemoCampaignInput,
  blueprint: CampaignBlueprint,
  style: ToneStyle,
): string {
  const subject = pick([
    `You're Invited — ${blueprint.headline(input.dealership_name)}`,
    `${input.dealership_name} has something for ${input.target_audience}`,
    `${style.opener} at ${input.dealership_name}`,
  ]);

  const body = [
    `Hey there,`,
    "",
    applyTone(blueprint.hook(input.dealership_name, input.target_audience), input.tone, style),
    "",
    applyTone(blueprint.body(input.dealership_name, input.target_audience), input.tone, style),
    "",
    applyTone(blueprint.offer(input.dealership_name), input.tone, style),
    "",
    `${style.ctaPrefix} — reply to this email, call ${input.dealership_name}, or stop by the showroom.`,
    "",
    `See you soon,`,
    `The team at ${input.dealership_name}`,
  ].join("\n");

  return `Subject: ${subject}\n\n${body}`;
}

function buildAdHeadline(
  input: DemoCampaignInput,
  blueprint: CampaignBlueprint,
): string {
  const platformFocus =
    input.platform === "instagram"
      ? pick(["Photo-ready deals", "Showroom spotlight", "Ride in today"])
      : input.platform === "sms"
        ? pick(["Quick deal alert", "Limited offer", "Act fast"])
        : pick(["Event this weekend", "Seasonal savings", "Local rider favorite"]);

  return truncate(`${platformFocus} — ${blueprint.headline(input.dealership_name)}`, 60);
}

export function generateCampaign(inputs: DemoCampaignInput): DemoCampaignOutput {
  const blueprint = CAMPAIGN_BLUEPRINTS[inputs.campaign_type];
  const style = TONE_STYLES[inputs.tone];

  return {
    facebook_post: buildFacebookPost(inputs, blueprint, style),
    instagram_caption: buildInstagramCaption(inputs, blueprint, style),
    sms_message: buildSmsMessage(inputs, blueprint, style),
    email_campaign: buildEmailCampaign(inputs, blueprint, style),
    ad_headline: buildAdHeadline(inputs, blueprint),
    cta_suggestions: pickMany(blueprint.ctas(inputs.dealership_name), 4),
  };
}
