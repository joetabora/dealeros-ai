import { INCLUDED_FEATURES } from "@/config/closing-kit";
import { formatCurrency } from "@/lib/closing-kit/roi-calculator";
import type { DealershipProposal, PilotProgramPricing } from "@/types/closing-kit";
import type { RoiCalculatorInput, RoiCalculatorOutput } from "@/types/closing-kit";

type GenerateProposalParams = {
  id: string;
  dealershipName: string;
  roi: RoiCalculatorOutput;
  roiInput: RoiCalculatorInput;
  pricing: PilotProgramPricing;
  sampleCampaignExcerpt: string;
  impactLifts: {
    engagementLift: number;
    attendanceLift: number;
    followUpLift: number;
  };
  demoDealershipId?: string;
};

export function generateDealershipProposal(
  params: GenerateProposalParams,
): DealershipProposal {
  const {
    id,
    dealershipName,
    roi,
    roiInput,
    pricing,
    sampleCampaignExcerpt,
    impactLifts,
    demoDealershipId,
  } = params;

  const summary = `${dealershipName} is positioned to capture an estimated ${formatCurrency(roi.revenueImpactLow)}–${formatCurrency(roi.revenueImpactHigh)} in additional monthly revenue through faster campaign execution, stronger event turnout, and automated lead follow-up. DealerOS AI handles the marketing output your team doesn't have time for — so you sell more units, book more service, and fill more events without adding headcount.`;

  const roiSummary = `Based on your store's current traffic (${roiInput.monthlyFootTraffic.toLocaleString()} monthly visitors), event attendance (${roiInput.eventAttendance}), ${roiInput.leadConversionRate}% lead conversion, and ${roiInput.serviceVolume} monthly service appointments, DealerOS projects: +${roi.eventAttendanceIncrease} event attendees (+${roi.eventAttendanceIncreasePct}%), +${roi.leadsIncrease} qualified leads (+${roi.leadsIncreasePct}%), and +${roi.serviceBookingsIncrease} service bookings (+${roi.serviceBookingsIncreasePct}%) per month.`;

  const nextSteps = [
    `Confirm ${pricing.pilotDays}-day pilot start date and primary contact at ${dealershipName}.`,
    "Complete a 30-minute setup call — we configure your dealership profile and memory layer.",
    "Generate your first full campaign pack live on the call — Facebook, Instagram, SMS, email, and ads.",
    "Review pilot results at day 14 and decide on full rollout.",
  ];

  return {
    id,
    dealershipName,
    createdAt: new Date().toISOString(),
    summary,
    includedFeatures: [...INCLUDED_FEATURES],
    pricing,
    roiSummary,
    nextSteps,
    sampleCampaignExcerpt,
    roi,
    roiInput,
    impactLifts,
    demoDealershipId,
  };
}

export function buildProposalDocumentText(proposal: DealershipProposal) {
  const lines = [
    `DEALERSHIP PROPOSAL — ${proposal.dealershipName.toUpperCase()}`,
    `Prepared by DealerOS AI · ${new Date(proposal.createdAt).toLocaleDateString()}`,
    "",
    "EXECUTIVE SUMMARY",
    proposal.summary,
    "",
    "INCLUDED IN YOUR PROGRAM",
    ...proposal.includedFeatures.map((feature) => `• ${feature}`),
    "",
    "INVESTMENT",
    `Setup Fee: ${formatCurrency(proposal.pricing.setupFee)}`,
    `Monthly Retainer: ${formatCurrency(proposal.pricing.monthlyRetainer)}/mo`,
    `Pilot Period: ${proposal.pricing.pilotDays} days`,
    "",
    "PROJECTED ROI",
    proposal.roiSummary,
    "",
    "SAMPLE CAMPAIGN OUTPUT",
    proposal.sampleCampaignExcerpt,
    "",
    "NEXT STEPS",
    ...proposal.nextSteps.map((step, index) => `${index + 1}. ${step}`),
  ];

  return lines.join("\n");
}
