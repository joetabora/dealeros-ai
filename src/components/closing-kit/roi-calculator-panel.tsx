"use client";

import { useMemo, useState } from "react";
import { Calculator, DollarSign, TrendingUp, Users, Wrench } from "lucide-react";

import { DEFAULT_ROI_INPUTS } from "@/config/closing-kit";
import {
  calculateRoi,
  formatCurrency,
} from "@/lib/closing-kit/roi-calculator";
import type { RoiCalculatorInput } from "@/types/closing-kit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoiCalculatorPanelProps = {
  initialInput?: Partial<RoiCalculatorInput>;
  impactLifts?: {
    engagementLift: number;
    attendanceLift: number;
    followUpLift: number;
  };
  onChange?: (input: RoiCalculatorInput) => void;
};

const FIELDS: Array<{
  key: keyof RoiCalculatorInput;
  label: string;
  hint: string;
}> = [
  {
    key: "monthlyFootTraffic",
    label: "Average monthly foot traffic",
    hint: "Showroom and lot visitors per month",
  },
  {
    key: "eventAttendance",
    label: "Current event attendance",
    hint: "Average turnout per major event",
  },
  {
    key: "leadConversionRate",
    label: "Lead conversion rate (%)",
    hint: "Visitors who become qualified leads",
  },
  {
    key: "serviceVolume",
    label: "Service department volume",
    hint: "Monthly service appointments",
  },
];

export function RoiCalculatorPanel({
  initialInput,
  impactLifts,
  onChange,
}: RoiCalculatorPanelProps) {
  const [input, setInput] = useState<RoiCalculatorInput>({
    ...DEFAULT_ROI_INPUTS,
    ...initialInput,
  });

  const output = useMemo(
    () =>
      calculateRoi(input, impactLifts ?? {
        engagementLift: 35,
        attendanceLift: 25,
        followUpLift: 38,
      }),
    [input, impactLifts],
  );

  function updateField(key: keyof RoiCalculatorInput, raw: string) {
    const value = Number.parseFloat(raw) || 0;
    const next = { ...input, [key]: value };
    setInput(next);
    onChange?.(next);
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle>ROI Calculator</CardTitle>
        </div>
        <CardDescription>
          Estimate the revenue impact DealerOS can drive for this store. Adjust
          the numbers to match what the dealer tells you on the call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                min={0}
                value={input[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
              />
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OutputMetric
            icon={Users}
            label="Event attendance"
            value={`+${output.eventAttendanceIncrease}`}
            sub={`+${output.eventAttendanceIncreasePct}% per event`}
          />
          <OutputMetric
            icon={TrendingUp}
            label="New leads"
            value={`+${output.leadsIncrease}`}
            sub={`+${output.leadsIncreasePct}% monthly`}
          />
          <OutputMetric
            icon={Wrench}
            label="Service bookings"
            value={`+${output.serviceBookingsIncrease}`}
            sub={`+${output.serviceBookingsIncreasePct}% monthly`}
          />
          <OutputMetric
            icon={DollarSign}
            label="Revenue impact"
            value={`${formatCurrency(output.revenueImpactLow)}–${formatCurrency(output.revenueImpactHigh)}`}
            sub="Estimated monthly range"
            highlight
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Projection model for sales conversations — not a performance guarantee.
        </p>
      </CardContent>
    </Card>
  );
}

type OutputMetricProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
};

function OutputMetric({ icon: Icon, label, value, sub, highlight }: OutputMetricProps) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-primary/30 bg-primary/10 p-4"
          : "rounded-xl border border-border/60 bg-background/50 p-4"
      }
    >
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
