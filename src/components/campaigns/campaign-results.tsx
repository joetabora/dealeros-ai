"use client";

import { Sparkles } from "lucide-react";

import { CopyButton } from "@/components/campaigns/copy-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  OUTPUT_FIELDS,
  type CampaignGeneratorOutputs,
} from "@/types/campaign";

type CampaignResultsProps = {
  outputs: CampaignGeneratorOutputs;
  onChange?: (outputs: CampaignGeneratorOutputs) => void;
  editable?: boolean;
};

export function CampaignResults({
  outputs,
  onChange,
  editable = false,
}: CampaignResultsProps) {
  function updateField<K extends keyof CampaignGeneratorOutputs>(
    key: K,
    value: CampaignGeneratorOutputs[K],
  ) {
    if (!onChange) return;
    onChange({ ...outputs, [key]: value });
  }

  return (
    <div className="space-y-4">
      {OUTPUT_FIELDS.map((field) => {
        const value = outputs[field.key];

        return (
          <Card
            key={field.key}
            className="border-border/60 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base">{field.label}</CardTitle>
                <CardDescription>{field.description}</CardDescription>
              </div>
              {field.key === "callToActionSuggestions" ? null : (
                <CopyButton
                  value={String(value)}
                  className="hidden sm:inline-flex"
                />
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {field.key === "callToActionSuggestions" ? (
                <div className="flex flex-wrap gap-2">
                  {outputs.callToActionSuggestions.map((cta) => (
                    <div
                      key={cta}
                      className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 py-1 pr-1 pl-3"
                    >
                      <span className="text-sm">{cta}</span>
                      <CopyButton value={cta} label="Copy" className="h-7 px-2" />
                    </div>
                  ))}
                </div>
              ) : editable && onChange ? (
                <Textarea
                  value={String(value)}
                  onChange={(event) =>
                    updateField(field.key, event.target.value as never)
                  }
                  rows={field.multiline ? 6 : 3}
                  className="min-h-24 resize-y bg-background/60"
                />
              ) : (
                <div className="rounded-xl border border-border/50 bg-background/40 p-4 text-sm leading-6 whitespace-pre-wrap text-foreground">
                  {String(value)}
                </div>
              )}

              {field.key !== "callToActionSuggestions" ? (
                <div className="flex items-center justify-between sm:hidden">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Ready to publish
                  </Badge>
                  <CopyButton value={String(value)} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function CampaignResultsEmpty() {
  return (
    <Card className="border-dashed border-border/70 bg-card/20">
      <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Your campaign package appears here</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Fill in the form and generate dealership-ready copy for Facebook,
            Instagram, SMS, email, ads, and CTAs in one shot.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
