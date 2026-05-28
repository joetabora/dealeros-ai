import type { CampaignGeneratorInput } from "@/types/campaign";
import type { DealershipMemoryProfile } from "@/types/memory";

export type DemoImpactMetrics = {
  engagementLift: number;
  attendanceLift: number;
  followUpLift: number;
};

export type DemoHistorySample = {
  id: string;
  campaignType: string;
  label: string;
  createdLabel: string;
  excerpt: string;
};

export type DemoDealershipProfile = {
  id: string;
  name: string;
  tagline: string;
  highlight: string;
  input: CampaignGeneratorInput;
  memory: DealershipMemoryProfile;
  impact: DemoImpactMetrics;
  memoryBullets: string[];
  historySamples: DemoHistorySample[];
};

export const DEMO_DEALERSHIPS: DemoDealershipProfile[] = [
  {
    id: "milwaukee-harley",
    name: "Milwaukee Harley-Davidson",
    tagline: "Weekend events. Full lot energy. Community-first marketing.",
    highlight: "High event engagement · energetic tone",
    input: {
      dealershipName: "Milwaukee Harley-Davidson",
      campaignType: "event",
      targetAudience: "Local riders, past buyers, and weekend event regulars",
      tone: "energetic",
      platform: "facebook",
    },
    memory: {
      dealershipName: "Milwaukee Harley-Davidson",
      preferredTone: "energetic",
      preferredCampaignType: "event",
      audienceInsights: [
        "Local riders who show up for weekend events",
        "Past buyers who respond to live music and lot parties",
      ],
      urgencyBoost: 1,
      hypeBoost: 2,
      professionalismBoost: 0,
      ctaStyle: "direct",
      preferredStructure: "hype",
      eventPatternStrength: 1,
    },
    impact: {
      engagementLift: 42,
      attendanceLift: 28,
      followUpLift: 35,
    },
    memoryBullets: [
      "Prefers energetic, hype-driven weekend event messaging",
      "Strong response to live music, food, and lot-party promotions",
      "Highest engagement on Facebook event posts published Thursdays",
    ],
    historySamples: [
      {
        id: "sample-mke-1",
        campaignType: "event",
        label: "Summer Ride-Out Weekend",
        createdLabel: "2 weeks ago",
        excerpt: "Big weekend at Milwaukee Harley-Davidson — live music, test rides, and event-only pricing…",
      },
      {
        id: "sample-mke-2",
        campaignType: "seasonal_sale",
        label: "Limited Inventory Push",
        createdLabel: "Last month",
        excerpt: "Select models moving fast at Milwaukee Harley-Davidson — seasonal numbers live now…",
      },
    ],
  },
  {
    id: "twin-cities-powersports",
    name: "Twin Cities Powersports",
    tagline: "Service revenue focus. Seasonal promos that convert.",
    highlight: "Service-heavy · discount responsive",
    input: {
      dealershipName: "Twin Cities Powersports",
      campaignType: "service_promo",
      targetAudience: "Service customers due for maintenance and seasonal checkups",
      tone: "community",
      platform: "email",
    },
    memory: {
      dealershipName: "Twin Cities Powersports",
      preferredTone: "community",
      preferredCampaignType: "service_promo",
      audienceInsights: [
        "Service customers who respond to seasonal maintenance reminders",
        "Owners who book when offers feel practical, not pushy",
      ],
      urgencyBoost: 1,
      hypeBoost: 0,
      professionalismBoost: 2,
      ctaStyle: "community",
      preferredStructure: "story",
      eventPatternStrength: 0,
    },
    impact: {
      engagementLift: 31,
      attendanceLift: 22,
      followUpLift: 48,
    },
    memoryBullets: [
      "Responds best to trust-based service messaging",
      "Seasonal discount framing outperforms generic promos",
      "Email campaigns drive the highest service appointment volume",
    ],
    historySamples: [
      {
        id: "sample-tc-1",
        campaignType: "service_promo",
        label: "Fall Service Special",
        createdLabel: "1 week ago",
        excerpt: "Beat the weather shift — Twin Cities Powersports is booking seasonal checkups now…",
      },
      {
        id: "sample-tc-2",
        campaignType: "seasonal_sale",
        label: "Winter Storage Promo",
        createdLabel: "3 weeks ago",
        excerpt: "Limited appointment windows open at Twin Cities Powersports — grab your bay…",
      },
    ],
  },
  {
    id: "lone-star-harley",
    name: "Lone Star Harley",
    tagline: "Aggressive sales energy. Urgency that moves inventory.",
    highlight: "High urgency · seasonal sale focus",
    input: {
      dealershipName: "Lone Star Harley",
      campaignType: "seasonal_sale",
      targetAudience: "Buyers waiting on the right deal and ready to finance now",
      tone: "aggressive_sales",
      platform: "sms",
    },
    memory: {
      dealershipName: "Lone Star Harley",
      preferredTone: "aggressive_sales",
      preferredCampaignType: "seasonal_sale",
      audienceInsights: [
        "High-intent buyers who respond to limited-time offers",
        "Shoppers ready to move when APR and inventory urgency is clear",
      ],
      urgencyBoost: 2,
      hypeBoost: 1,
      professionalismBoost: 0,
      ctaStyle: "direct",
      preferredStructure: "hype",
      eventPatternStrength: 0.5,
    },
    impact: {
      engagementLift: 38,
      attendanceLift: 19,
      followUpLift: 41,
    },
    memoryBullets: [
      "Inventory urgency and limited-time framing drive conversions",
      "SMS blasts outperform email for same-day showroom traffic",
      "Aggressive sales tone aligns with this dealership's brand voice",
    ],
    historySamples: [
      {
        id: "sample-ls-1",
        campaignType: "seasonal_sale",
        label: "End-of-Month Inventory Push",
        createdLabel: "4 days ago",
        excerpt: "Limited-time deals live at Lone Star Harley — inventory won't sit long…",
      },
    ],
  },
  {
    id: "iron-horse-motors",
    name: "Iron Horse Motors",
    tagline: "Win-back campaigns. Premium tone. Loyalty reactivation.",
    highlight: "Reactivation · premium voice",
    input: {
      dealershipName: "Iron Horse Motors",
      campaignType: "reactivation",
      targetAudience: "Past buyers and dormant leads who haven't visited in 6+ months",
      tone: "premium",
      platform: "instagram",
    },
    memory: {
      dealershipName: "Iron Horse Motors",
      preferredTone: "premium",
      preferredCampaignType: "reactivation",
      audienceInsights: [
        "Past buyers who respond to personalized comeback offers",
        "Dormant leads who prefer polished, respectful outreach",
      ],
      urgencyBoost: 1,
      hypeBoost: 0,
      professionalismBoost: 2,
      ctaStyle: "premium",
      preferredStructure: "story",
      eventPatternStrength: 0,
    },
    impact: {
      engagementLift: 29,
      attendanceLift: 24,
      followUpLift: 52,
    },
    memoryBullets: [
      "Reactivation campaigns perform best with premium, personal tone",
      "Win-back offers framed as exclusive outperform generic discounts",
      "Instagram captions generate strong re-engagement from dormant leads",
    ],
    historySamples: [
      {
        id: "sample-ih-1",
        campaignType: "reactivation",
        label: "We Miss You Comeback Offer",
        createdLabel: "5 days ago",
        excerpt: "Iron Horse Motors kept something on the table for riders ready to roll back in…",
      },
    ],
  },
];

export function getDemoDealership(id: string) {
  return DEMO_DEALERSHIPS.find((dealer) => dealer.id === id);
}

export function getDefaultDemoDealership() {
  return DEMO_DEALERSHIPS[0]!;
}
