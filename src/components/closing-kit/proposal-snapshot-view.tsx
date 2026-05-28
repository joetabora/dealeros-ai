"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { CopyButton } from "@/components/campaigns/copy-button";
import { SYSTEM_BENEFITS } from "@/config/closing-kit";
import { buildProposalDocumentText } from "@/lib/closing-kit/proposal-generator";
import { formatCurrency } from "@/lib/closing-kit/roi-calculator";
import type { DealershipProposal } from "@/types/closing-kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProposalSnapshotViewProps = {
  proposal: DealershipProposal;
};

export function ProposalSnapshotView({ proposal }: ProposalSnapshotViewProps) {
  const documentText = buildProposalDocumentText(proposal);

  return (
    <div className="proposal-snapshot mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" render={<Link href="/dashboard/closing-kit" />}>
          <ArrowLeft />
          Back to Closing Kit
        </Button>
        <div className="flex gap-2">
          <CopyButton value={documentText} label="Copy full proposal" />
          <Button type="button" onClick={() => window.print()}>
            <Printer />
            Print snapshot
          </Button>
        </div>
      </div>

      <header className="space-y-3 border-b border-border/60 pb-6 text-center">
        <Badge className="bg-primary/15 text-primary">Dealership Snapshot</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          {proposal.dealershipName}
        </h1>
        <p className="text-muted-foreground">
          DealerOS AI · Prepared{" "}
          {new Date(proposal.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </header>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle>Why DealerOS</CardTitle>
          <CardDescription>{proposal.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {SYSTEM_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-2 text-sm leading-6">
                <span className="text-primary">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Included in your program</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm leading-6">
              {proposal.includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Investment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Setup fee: </span>
              <span className="font-semibold">
                {formatCurrency(proposal.pricing.setupFee)}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Monthly retainer: </span>
              <span className="font-semibold">
                {formatCurrency(proposal.pricing.monthlyRetainer)}/mo
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Pilot period: </span>
              <span className="font-semibold">{proposal.pricing.pilotDays} days</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Projected ROI</CardTitle>
          <CardDescription>{proposal.roiSummary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <Metric
              label="Event attendance"
              value={`+${proposal.roi.eventAttendanceIncrease}`}
            />
            <Metric label="New leads" value={`+${proposal.roi.leadsIncrease}`} />
            <Metric
              label="Service bookings"
              value={`+${proposal.roi.serviceBookingsIncrease}`}
            />
            <Metric
              label="Monthly revenue"
              value={`${formatCurrency(proposal.roi.revenueImpactLow)}–${formatCurrency(proposal.roi.revenueImpactHigh)}`}
              highlight
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Sample AI campaign output</CardTitle>
          <CardDescription>
            Generated by DealerOS — tuned to {proposal.dealershipName}&apos;s voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-sm leading-6 italic">
            {proposal.sampleCampaignExcerpt}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Next steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm leading-6">
            {proposal.nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <footer className="rounded-xl border border-border/60 bg-card/40 p-6 text-center print:border-0 print:bg-transparent">
        <p className="font-semibold">Ready to move forward?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact your DealerOS representative to start the{" "}
          {proposal.pricing.pilotDays}-day pilot program.
        </p>
      </footer>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function Metric({ label, value, highlight }: MetricProps) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-primary/30 bg-primary/10 p-3"
          : "rounded-xl border border-border/60 bg-background/50 p-3"
      }
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
