"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import { GenerateFullCampaignButton } from "@/components/marketing/generate-full-campaign-button";
import { MarketingForm } from "@/components/marketing/marketing-form";
import {
  MarketingResults,
  MarketingResultsEmpty,
} from "@/components/marketing/marketing-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateFullCampaignAction,
  saveMarketingCampaignAction,
} from "@/lib/marketing/actions";
import { getMarketingTypeLabel } from "@/lib/marketing/validation";
import type {
  FullMarketingCampaignOutput,
  MarketingCampaign,
  MarketingFormState,
} from "@/types/marketing";

const initialState: MarketingFormState = {};

type MarketingEngineProps = {
  initialHistory: MarketingCampaign[];
  defaultDealershipName?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MarketingEngine({
  initialHistory,
  defaultDealershipName,
}: MarketingEngineProps) {
  const [history, setHistory] = useState(initialHistory);
  const [activeCampaign, setActiveCampaign] = useState<MarketingCampaign | null>(
    initialHistory[0] ?? null,
  );
  const [editedOutputs, setEditedOutputs] =
    useState<FullMarketingCampaignOutput | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [generateState, generateAction] = useActionState(
    generateFullCampaignAction,
    initialState,
  );
  const [saveState, saveAction] = useActionState(
    saveMarketingCampaignAction,
    initialState,
  );

  const currentOutputs =
    editedOutputs ?? activeCampaign?.outputsJson ?? null;

  const isDirty = useMemo(() => {
    if (!activeCampaign || !editedOutputs) return false;
    return (
      JSON.stringify(editedOutputs) !==
      JSON.stringify(activeCampaign.outputsJson)
    );
  }, [activeCampaign, editedOutputs]);

  useEffect(() => {
    if (generateState.campaign) {
      setActiveCampaign(generateState.campaign);
      setEditedOutputs(generateState.campaign.outputsJson);
      setHistory((current) => {
        const exists = current.some(
          (item) => item.id === generateState.campaign?.id,
        );
        if (exists) {
          return current.map((item) =>
            item.id === generateState.campaign?.id
              ? generateState.campaign!
              : item,
          );
        }
        return [generateState.campaign!, ...current];
      });
      setActiveTab("results");
      setEditMode(false);
      setSaveMessage("Saved to marketing history and campaign library.");
    }
  }, [generateState.campaign]);

  useEffect(() => {
    if (saveState.campaign) {
      setActiveCampaign(saveState.campaign);
      setEditedOutputs(saveState.campaign.outputsJson);
      setHistory((current) =>
        current.map((item) =>
          item.id === saveState.campaign?.id ? saveState.campaign! : item,
        ),
      );
      setSaveMessage("Changes saved.");
    }
  }, [saveState.campaign]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="border-border/60 bg-card/50 xl:sticky xl:top-20 xl:self-start">
        <CardHeader>
          <Badge className="w-fit bg-primary/15 text-primary">Core Engine</Badge>
          <CardTitle>One-Click Marketing</CardTitle>
          <CardDescription>
            One idea in. Full dealership marketing department out — strategy,
            social, SMS, email, timeline, and revenue CTAs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateAction} className="space-y-5">
            <MarketingForm defaultValues={{ dealershipName: defaultDealershipName }} />

            {generateState.error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {generateState.error}
              </div>
            ) : null}

            <GenerateFullCampaignButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "results" | "history")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="results">Campaign output</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {activeCampaign && currentOutputs ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditMode((current) => !current)}
                >
                  {editMode ? "Preview mode" : "Edit mode"}
                </Button>
                {isDirty ? (
                  <form action={saveAction}>
                    <input type="hidden" name="campaignId" value={activeCampaign.id} />
                    <input
                      type="hidden"
                      name="outputsJson"
                      value={JSON.stringify(editedOutputs)}
                    />
                    <Button type="submit" size="sm">
                      Save changes
                    </Button>
                  </form>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  render={
                    <Link href={`/dashboard/marketing/${activeCampaign.id}`} />
                  }
                >
                  Open full view
                </Button>
              </div>
            ) : null}
          </div>

          {saveMessage ? (
            <div
              role="status"
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
            >
              {saveMessage}
            </div>
          ) : null}

          {saveState.error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {saveState.error}
            </div>
          ) : null}

          <TabsContent value="results" className="mt-4">
            {currentOutputs ? (
              <MarketingResults
                outputs={currentOutputs}
                editable={editMode}
                onChange={setEditedOutputs}
              />
            ) : (
              <MarketingResultsEmpty />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {history.length === 0 ? (
              <MarketingResultsEmpty />
            ) : (
              history.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => {
                    setActiveCampaign(campaign);
                    setEditedOutputs(campaign.outputsJson);
                    setActiveTab("results");
                    setEditMode(false);
                  }}
                  className="block w-full rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-colors hover:border-primary/30 hover:bg-card/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{campaign.eventOrOfferName}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.dealershipName} ·{" "}
                        {getMarketingTypeLabel(campaign.campaignType)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
