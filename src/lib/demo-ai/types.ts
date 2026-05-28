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

export type CampaignContext = {
  urgencyLevel: number;
  hypeLevel: number;
  professionalismLevel: number;
  emotionalTone: string;
  audienceTypeModifier: string;
};

export type DealerPlacement = "hook" | "mid" | "close";

export type GenerationRuntime = {
  rng: SeededRandom;
  context: CampaignContext;
  input: DemoCampaignInput;
  dealerPlacement: DealerPlacement;
  useRhetoricalQuestion: boolean;
};

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = Math.abs(Math.floor(seed)) || 1;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]!;
  }

  pickMany<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const selected: T[] = [];

    while (selected.length < count && pool.length > 0) {
      const index = Math.floor(this.next() * pool.length);
      selected.push(pool.splice(index, 1)[0]!);
    }

    return selected;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
