import type { RoiCalculatorInput } from "@/types/closing-kit";

export const INCLUDED_FEATURES = [
  "AI Campaign Generator — full-channel marketing in seconds",
  "Event Engine — lot traffic and show promotions on autopilot",
  "Reactivation System — win back dormant leads automatically",
  "Memory Layer — AI learns your dealership voice over time",
  "Live Demo Mode — instant proof for your team and ownership",
] as const;

export const DEFAULT_PILOT_PRICING = {
  setupFee: 2500,
  monthlyRetainer: 1499,
  pilotDays: 21,
} as const;

export const DEFAULT_ROI_INPUTS: RoiCalculatorInput = {
  monthlyFootTraffic: 850,
  eventAttendance: 120,
  leadConversionRate: 8,
  serviceVolume: 340,
};

export type DealerObjection = {
  id: string;
  question: string;
  headline: string;
  points: string[];
};

export const DEALER_OBJECTIONS: DealerObjection[] = [
  {
    id: "has-agency",
    question: "We already have a marketing agency",
    headline: "Agencies create content. DealerOS creates revenue.",
    points: [
      "Your agency takes days to turn around a campaign. DealerOS generates a full pack in seconds — Facebook, Instagram, SMS, email, and ads.",
      "Agencies rarely touch reactivation, service reminders, or event follow-up. DealerOS automates the gaps that cost you showroom and service bay revenue.",
      "Keep your agency for brand work. Use DealerOS for speed, consistency, and daily dealership marketing that actually moves units.",
    ],
  },
  {
    id: "no-time",
    question: "We don't have time for new systems",
    headline: "Zero workload setup. Plug in and go.",
    points: [
      "No onboarding marathon. Select your dealership, hit generate, and you have ready-to-send campaigns in under a minute.",
      "DealerOS automates what your team already does manually — social posts, email blasts, SMS promos, and event pushes.",
      "Your staff keeps doing what they do best. DealerOS handles the marketing output so nothing falls through the cracks.",
    ],
  },
  {
    id: "replaces-staff",
    question: "Does this replace our staff?",
    headline: "This makes your team more powerful — not smaller.",
    points: [
      "DealerOS is an augmentation layer. Your BDC, marketing coordinator, and GM stay in control.",
      "One person can now produce what used to take a full marketing week — across every channel, tuned to your store's voice.",
      "Think of it as giving every team member a senior marketing director in their pocket.",
    ],
  },
];

export const CLOSE_NOW_OPTIONS = [
  {
    id: "pilot",
    title: "Start Pilot Program",
    description:
      "Low-risk entry. Full system access for 14–30 days. Prove ROI before you commit.",
    badge: "Recommended",
    cta: "Begin 21-day pilot",
  },
  {
    id: "call",
    title: "Schedule Implementation Call",
    description:
      "Walk through setup with our team. Custom configuration for your store's goals.",
    badge: null,
    cta: "Book a 30-minute call",
  },
  {
    id: "full",
    title: "Get Full Setup Today",
    description:
      "Skip the wait. White-glove onboarding and first campaigns live within 48 hours.",
    badge: null,
    cta: "Start full setup",
  },
] as const;

export const SYSTEM_BENEFITS = [
  "Generate full marketing campaigns in seconds, not days",
  "Every channel covered — social, SMS, email, and paid ads",
  "AI learns your dealership voice and gets smarter over time",
  "Reactivate dormant leads and fill service bays automatically",
  "No technical skills required — built for dealership teams",
] as const;
