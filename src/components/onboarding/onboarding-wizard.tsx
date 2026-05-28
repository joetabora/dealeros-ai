"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { completeOnboardingSetupAction } from "@/lib/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEALERSHIP_TYPES, type DealershipType } from "@/types/onboarding";
import { cn } from "@/lib/utils";

type OnboardingWizardProps = {
  defaultDealershipName: string;
};

const STEPS = ["welcome", "details", "generating", "complete"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard({ defaultDealershipName }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [dealershipName, setDealershipName] = useState(defaultDealershipName);
  const [dealershipType, setDealershipType] = useState<DealershipType>("harley");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      setError(null);
      setStep("generating");
      const result = await completeOnboardingSetupAction({
        dealershipName,
        dealershipType,
      });

      if (result.error) {
        setError(result.error);
        setStep("details");
        return;
      }

      setStep("complete");
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((entry, index) => (
          <div
            key={entry}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              STEPS.indexOf(step) >= index ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {step === "welcome" ? (
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Let&apos;s set up your dealership marketing system
            </CardTitle>
            <CardDescription className="text-base">
              Two quick questions. Then we generate sample campaigns, events, and
              leads so you can see value immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep("details")}
            >
              Start Setup
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "details" ? (
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle>Tell us about your store</CardTitle>
            <CardDescription>
              Just your name and type — nothing else required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dealership-name">Dealership name</Label>
              <Input
                id="dealership-name"
                value={dealershipName}
                onChange={(event) => setDealershipName(event.target.value)}
                placeholder="Your dealership"
              />
            </div>
            <div className="space-y-2">
              <Label>Dealership type</Label>
              <Select
                value={dealershipType}
                onValueChange={(value) =>
                  setDealershipType(value as DealershipType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DEALERSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              size="lg"
              className="w-full"
              disabled={!dealershipName.trim() || isPending}
              onClick={handleGenerate}
            >
              Generate My System
              <Sparkles />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "generating" ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold">Building your system...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Creating a sample campaign, event, leads, and analytics snapshot.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "complete" ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-card/40">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your dealership system is ready.</CardTitle>
            <CardDescription className="text-base">
              Sample campaign, event, leads, and scheduled posts are waiting in
              your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              render={<Link href="/dashboard" />}
              onClick={() => router.refresh()}
            >
              Enter Dashboard
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
