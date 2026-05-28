"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";

import { CopyButton } from "@/components/campaigns/copy-button";
import { generateProposalAction } from "@/lib/closing-kit/actions";
import type {
  DealershipProposal,
  PilotProgramPricing,
  RoiCalculatorInput,
} from "@/types/closing-kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProposalGeneratorPanelProps = {
  dealershipName: string;
  demoDealershipId?: string;
  roiInput: RoiCalculatorInput;
  pricing: PilotProgramPricing;
  sampleCampaignExcerpt: string;
};

export function ProposalGeneratorPanel({
  dealershipName,
  demoDealershipId,
  roiInput,
  pricing,
  sampleCampaignExcerpt,
}: ProposalGeneratorPanelProps) {
  const [proposal, setProposal] = useState<DealershipProposal | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      setError(null);

      try {
        const result = await generateProposalAction({
          dealershipName,
          demoDealershipId,
          roiInput,
          pricing,
          sampleCampaignExcerpt,
        });

        setProposal(result.proposal);
        setDocumentText(result.documentText);
      } catch {
        setError("Unable to generate proposal. Please try again.");
      }
    });
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle>Generate Dealership Proposal</CardTitle>
        </div>
        <CardDescription>
          One click produces a professional proposal for {dealershipName} —
          ready to email, print, or walk through on a Zoom call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Building proposal...
            </>
          ) : (
            <>
              <FileText />
              Generate Dealership Proposal
            </>
          )}
        </Button>

        {proposal && documentText ? (
          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{proposal.dealershipName}</p>
                <p className="text-sm text-muted-foreground">
                  Proposal ready — share the snapshot or copy the full document.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={documentText} label="Copy proposal" />
                <Button
                  size="sm"
                  render={<Link href={`/dashboard/proposal/${proposal.id}`} />}
                >
                  Open snapshot
                </Button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-background/60 p-4 text-sm leading-6 whitespace-pre-wrap">
              {documentText.slice(0, 600)}
              {documentText.length > 600 ? "…" : ""}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
