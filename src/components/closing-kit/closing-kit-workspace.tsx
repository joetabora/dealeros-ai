"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";

import { DEFAULT_PILOT_PRICING, DEFAULT_ROI_INPUTS } from "@/config/closing-kit";
import { CloseNowFlow } from "@/components/closing-kit/close-now-flow";
import { ObjectionHandlerPanel } from "@/components/closing-kit/objection-handler-panel";
import { PilotProgramPanel } from "@/components/closing-kit/pilot-program-panel";
import { ProposalGeneratorPanel } from "@/components/closing-kit/proposal-generator-panel";
import { RoiCalculatorPanel } from "@/components/closing-kit/roi-calculator-panel";
import type { ClosingKitContext } from "@/types/closing-kit";
import type { PilotProgramPricing, RoiCalculatorInput } from "@/types/closing-kit";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClosingKitWorkspaceProps = {
  initialContext?: ClosingKitContext;
};

export function ClosingKitWorkspace({ initialContext }: ClosingKitWorkspaceProps) {
  const [dealershipName, setDealershipName] = useState(
    initialContext?.dealershipName ?? "Your Dealership",
  );
  const [roiInput, setRoiInput] = useState<RoiCalculatorInput>({
    ...DEFAULT_ROI_INPUTS,
    ...initialContext?.roiDefaults,
  });
  const [pricing, setPricing] = useState<PilotProgramPricing>({
    ...DEFAULT_PILOT_PRICING,
  });

  const sampleExcerpt =
    initialContext?.sampleExcerpt ??
    "Sample campaign output will appear here after running the live demo.";

  return (
    <div className="space-y-8">
      <section className="space-y-3 text-center">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Handshake className="mr-1 size-3" />
          Dealership Closing Kit
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Turn the demo into a deal.
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Handle objections, quantify ROI, generate a proposal, and guide the
          next step — all in one place. Built for live sales conversations.
        </p>
      </section>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <Label htmlFor="dealershipName">Dealership name</Label>
        <Input
          id="dealershipName"
          className="mt-2 max-w-md"
          value={dealershipName}
          onChange={(event) => setDealershipName(event.target.value)}
          placeholder="Milwaukee Harley-Davidson"
        />
      </div>

      <RoiCalculatorPanel
        initialInput={initialContext?.roiDefaults}
        impactLifts={initialContext?.impactLifts}
        onChange={setRoiInput}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ObjectionHandlerPanel />
        <PilotProgramPanel pricing={pricing} onChange={setPricing} />
      </div>

      <ProposalGeneratorPanel
        dealershipName={dealershipName}
        demoDealershipId={initialContext?.demoDealershipId}
        roiInput={roiInput}
        pricing={pricing}
        sampleCampaignExcerpt={sampleExcerpt}
      />

      <CloseNowFlow />
    </div>
  );
}
