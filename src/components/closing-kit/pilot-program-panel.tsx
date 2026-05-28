"use client";

import { DEFAULT_PILOT_PRICING } from "@/config/closing-kit";
import type { PilotProgramPricing } from "@/types/closing-kit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PilotProgramPanelProps = {
  pricing: PilotProgramPricing;
  onChange: (pricing: PilotProgramPricing) => void;
};

export function PilotProgramPanel({ pricing, onChange }: PilotProgramPanelProps) {
  function updateField<K extends keyof PilotProgramPricing>(
    key: K,
    raw: string,
  ) {
    onChange({
      ...pricing,
      [key]: Number.parseFloat(raw) || DEFAULT_PILOT_PRICING[key],
    });
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/60 to-card/40">
      <CardHeader>
        <CardTitle>Pilot Program Framework</CardTitle>
        <CardDescription>
          Default offer structure for live selling. Adjust numbers on the call —
          this is your closing anchor, not billing logic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="setupFee">Setup fee</Label>
            <Input
              id="setupFee"
              type="number"
              min={0}
              value={pricing.setupFee}
              onChange={(event) => updateField("setupFee", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyRetainer">Monthly retainer</Label>
            <Input
              id="monthlyRetainer"
              type="number"
              min={0}
              value={pricing.monthlyRetainer}
              onChange={(event) =>
                updateField("monthlyRetainer", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pilotDays">Pilot length (days)</Label>
            <Input
              id="pilotDays"
              type="number"
              min={14}
              max={30}
              value={pricing.pilotDays}
              onChange={(event) => updateField("pilotDays", event.target.value)}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/50 p-4 text-sm leading-6">
          <p className="font-medium">How to pitch it:</p>
          <p className="mt-2 text-muted-foreground">
            &ldquo;We start with a {pricing.pilotDays}-day pilot — full access,
            zero long-term commitment. Setup is{" "}
            {pricing.setupFee.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
            , then{" "}
            {pricing.monthlyRetainer.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
            /mo after you see results. Low risk, high upside.&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
