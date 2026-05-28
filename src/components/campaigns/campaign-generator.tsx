"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import { CampaignForm } from "@/components/campaigns/campaign-form";
import { CampaignHistory } from "@/components/campaigns/campaign-history";
import {
  CampaignResults,
  CampaignResultsEmpty,
} from "@/components/campaigns/campaign-results";
import { GenerateSubmitButton } from "@/components/campaigns/generate-submit-button";
import { SaveCampaignButton } from "@/components/campaigns/save-campaign-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCampaignAction,
  saveCampaignAction,
} from "@/lib/campaigns/actions";
import {
  getCampaignPlatformLabel,
  getCampaignToneLabel,
  getCampaignTypeLabel,
} from "@/lib/campaigns/validation";
import type {
  Campaign,
  CampaignFormState,
  CampaignGeneratorOutputs,
} from "@/types/campaign";

const initialState: CampaignFormState = {};

type CampaignGeneratorProps = {
  initialHistory: Campaign[];
  defaultDealershipName?: string;
};

export function CampaignGenerator({
  initialHistory,
  defaultDealershipName,
}: CampaignGeneratorProps) {
  const [history, setHistory] = useState(initialHistory);
  const [activeGeneration, setActiveGeneration] = useState<Campaign | null>(
    initialHistory[0] ?? null,
  );
  const [editedOutputs, setEditedOutputs] =
    useState<CampaignGeneratorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [generateState, generateAction] = useActionState(
    generateCampaignAction,
    initialState,
  );
  const [saveState, saveAction] = useActionState(saveCampaignAction, initialState);

  const currentOutputs = editedOutputs ?? activeGeneration?.outputsJson ?? null;
  const isDirty = useMemo(() => {
    if (!activeGeneration || !editedOutputs) return false;
    return (
      JSON.stringify(editedOutputs) !==
      JSON.stringify(activeGeneration.outputsJson)
    );
  }, [activeGeneration, editedOutputs]);

  useEffect(() => {
    if (generateState.generation) {
      setActiveGeneration(generateState.generation);
      setEditedOutputs(generateState.generation.outputsJson);
      setHistory((current) => {
        const exists = current.some(
          (item) => item.id === generateState.generation?.id,
        );
        if (exists) {
          return current.map((item) =>
            item.id === generateState.generation?.id
              ? generateState.generation!
              : item,
          );
        }
        return [generateState.generation!, ...current];
      });
      setActiveTab("results");
      setSaveMessage(null);
    }
  }, [generateState.generation]);

  useEffect(() => {
    if (saveState.generation) {
      setActiveGeneration(saveState.generation);
      setEditedOutputs(saveState.generation.outputsJson);
      setHistory((current) =>
        current.map((item) =>
          item.id === saveState.generation?.id ? saveState.generation! : item,
        ),
      );
      setSaveMessage("Campaign saved.");
    }
  }, [saveState.generation]);

  function handleSelectGeneration(generation: Campaign) {
    setActiveGeneration(generation);
    setEditedOutputs(generation.outputsJson);
    setActiveTab("results");
    setSaveMessage(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="border-border/60 bg-card/50 xl:sticky xl:top-20 xl:self-start">
        <CardHeader>
          <CardTitle>Campaign brief</CardTitle>
          <CardDescription>
            Tell DealerOS AI what you are promoting. It returns a full
            multi-channel package built for dealership culture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateAction} className="space-y-5">
            <CampaignForm
              key={activeGeneration?.id ?? "new-campaign"}
              defaultValues={{
                dealershipName:
                  defaultDealershipName ?? activeGeneration?.dealershipName,
                campaignType: activeGeneration?.inputsJson.campaignType,
                targetAudience: activeGeneration?.inputsJson.targetAudience,
                tone: activeGeneration?.inputsJson.tone,
                platform: activeGeneration?.inputsJson.platform,
              }}
            />

            {generateState.error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {generateState.error}
              </div>
            ) : null}

            <GenerateSubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "results" | "history")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">
                History ({history.length})
              </TabsTrigger>
            </TabsList>

            {activeGeneration ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {getCampaignTypeLabel(activeGeneration.campaignType)}
                </Badge>
                <Badge variant="secondary">
                  {getCampaignToneLabel(activeGeneration.inputsJson.tone)}
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {getCampaignPlatformLabel(activeGeneration.inputsJson.platform)}
                </Badge>
              </div>
            ) : null}
          </div>

          <TabsContent value="results" className="space-y-4">
            {activeGeneration && currentOutputs ? (
              <>
                <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{activeGeneration.dealershipName}</p>
                    <p className="text-sm text-muted-foreground">
                      {isDirty
                        ? "You have unsaved edits."
                        : "Campaign generated and saved to your library."}
                    </p>
                    {saveMessage ? (
                      <p className="text-sm text-primary">{saveMessage}</p>
                    ) : null}
                    {saveState.error ? (
                      <p className="text-sm text-destructive">{saveState.error}</p>
                    ) : null}
                    {activeGeneration ? (
                      <Link
                        href={`/dashboard/campaigns/${activeGeneration.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View saved campaign
                      </Link>
                    ) : null}
                  </div>

                  <form action={saveAction}>
                    <input
                      type="hidden"
                      name="generationId"
                      value={activeGeneration.id}
                    />
                    <input
                      type="hidden"
                      name="outputsJson"
                      value={JSON.stringify(currentOutputs)}
                    />
                    <SaveCampaignButton />
                  </form>
                </div>

                <CampaignResults
                  outputs={currentOutputs}
                  editable
                  onChange={setEditedOutputs}
                />
              </>
            ) : (
              <CampaignResultsEmpty />
            )}
          </TabsContent>

          <TabsContent value="history">
            <CampaignHistory
              generations={history}
              activeId={activeGeneration?.id}
              onSelect={handleSelectGeneration}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
