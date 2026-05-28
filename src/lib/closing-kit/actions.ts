"use server";

import { randomUUID } from "crypto";

import {
  DEFAULT_PILOT_PRICING,
  DEFAULT_ROI_INPUTS,
} from "@/config/closing-kit";
import { getDemoDealership } from "@/config/demo-dealerships";
import {
  buildProposalDocumentText,
  generateDealershipProposal,
} from "@/lib/closing-kit/proposal-generator";
import { saveProposal } from "@/lib/closing-kit/proposal-store";
import { calculateRoi } from "@/lib/closing-kit/roi-calculator";
import type { PilotProgramPricing, RoiCalculatorInput } from "@/types/closing-kit";

export type GenerateProposalInput = {
  dealershipName: string;
  demoDealershipId?: string;
  roiInput?: Partial<RoiCalculatorInput>;
  pricing?: Partial<PilotProgramPricing>;
  sampleCampaignExcerpt?: string;
};

export async function generateProposalAction(input: GenerateProposalInput) {
  const dealership = input.demoDealershipId
    ? getDemoDealership(input.demoDealershipId)
    : undefined;

  const dealershipName =
    input.dealershipName.trim() ||
    dealership?.name ||
    "Your Dealership";

  const roiInput: RoiCalculatorInput = {
    ...DEFAULT_ROI_INPUTS,
    ...dealership?.roiDefaults,
    ...input.roiInput,
  };

  const impactLifts = dealership?.impact ?? {
    engagementLift: 35,
    attendanceLift: 25,
    followUpLift: 38,
  };

  const pricing: PilotProgramPricing = {
    ...DEFAULT_PILOT_PRICING,
    ...input.pricing,
  };

  const sampleCampaignExcerpt =
    input.sampleCampaignExcerpt?.trim() ||
    dealership?.historySamples[0]?.excerpt ||
    "Your AI-generated campaign preview will appear here after running the demo generator.";

  const roi = calculateRoi(roiInput, impactLifts);
  const id = randomUUID();

  const proposal = generateDealershipProposal({
    id,
    dealershipName,
    roi,
    roiInput,
    pricing,
    sampleCampaignExcerpt,
    impactLifts,
    demoDealershipId: input.demoDealershipId,
  });

  await saveProposal(proposal);

  return {
    proposal,
    documentText: buildProposalDocumentText(proposal),
  };
}
