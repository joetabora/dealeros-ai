import type { CampaignGeneratorOutputs } from "@/types/campaign";

export type RoiCalculatorInput = {
  monthlyFootTraffic: number;
  eventAttendance: number;
  leadConversionRate: number;
  serviceVolume: number;
};

export type RoiCalculatorOutput = {
  eventAttendanceIncrease: number;
  eventAttendanceIncreasePct: number;
  leadsIncrease: number;
  leadsIncreasePct: number;
  serviceBookingsIncrease: number;
  serviceBookingsIncreasePct: number;
  revenueImpactLow: number;
  revenueImpactHigh: number;
};

export type PilotProgramPricing = {
  setupFee: number;
  monthlyRetainer: number;
  pilotDays: number;
};

export type DealershipProposal = {
  id: string;
  dealershipName: string;
  createdAt: string;
  summary: string;
  includedFeatures: string[];
  pricing: PilotProgramPricing;
  roiSummary: string;
  nextSteps: string[];
  sampleCampaignExcerpt: string;
  roi: RoiCalculatorOutput;
  roiInput: RoiCalculatorInput;
  impactLifts: {
    engagementLift: number;
    attendanceLift: number;
    followUpLift: number;
  };
  demoDealershipId?: string;
};

export type ClosingKitContext = {
  dealershipName: string;
  demoDealershipId?: string;
  sampleCampaign?: CampaignGeneratorOutputs;
  sampleExcerpt?: string;
  impactLifts?: {
    engagementLift: number;
    attendanceLift: number;
    followUpLift: number;
  };
  roiDefaults?: RoiCalculatorInput;
};
