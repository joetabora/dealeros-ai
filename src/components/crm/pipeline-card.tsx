"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  MessageSquare,
  Phone,
  StickyNote,
} from "lucide-react";

import {
  markPipelineContactedAction,
  scheduleFollowUpAction,
  updatePipelineNotesAction,
  updatePipelineStageAction,
} from "@/lib/crm/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CRM_NEXT_ACTION_LABELS,
  CRM_PRIORITY_COLORS,
  CRM_PRIORITY_LABELS,
  CRM_STAGE_LABELS,
  type CrmPipelineWithLead,
  type CrmStage,
} from "@/types/crm";
import { LEAD_INTEREST_LABELS, LEAD_SOURCE_LABELS } from "@/types/leads";

type PipelineCardProps = {
  entry: CrmPipelineWithLead;
  onUpdated?: () => void;
};

const STAGE_ACTIONS: Partial<Record<CrmStage, { label: string; stage: CrmStage }[]>> = {
  new: [{ label: "Mark contacted", stage: "contacted" }],
  contacted: [{ label: "Mark qualified", stage: "qualified" }],
  qualified: [{ label: "Set appointment", stage: "appointment_set" }],
  appointment_set: [{ label: "Mark converted", stage: "converted" }],
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function urgencyLabel(level: CrmPipelineWithLead["urgencyLevel"]) {
  if (level === "today") return "Due today";
  if (level === "soon") return "Due soon";
  if (level === "scheduled") return "Scheduled";
  return "No urgency";
}

function urgencyColor(level: CrmPipelineWithLead["urgencyLevel"]) {
  if (level === "today") return "bg-rose-500/15 text-rose-400";
  if (level === "soon") return "bg-amber-500/15 text-amber-400";
  if (level === "scheduled") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

export function PipelineCard({ entry, onUpdated }: PipelineCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(entry.notes ?? "");
  const contactLabel =
    entry.lead.name ?? entry.lead.phone ?? entry.lead.email ?? "Unknown contact";

  function runAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.error) {
        onUpdated?.();
      }
    });
  }

  function moveStage(stage: CrmStage) {
    runAction(() => updatePipelineStageAction(entry.id, stage));
  }

  function saveNotes() {
    runAction(() => updatePipelineNotesAction(entry.id, notes));
    setShowNotes(false);
  }

  function scheduleTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    runAction(() =>
      scheduleFollowUpAction({
        pipelineId: entry.id,
        nextAction: entry.lead.phone ? "text" : "email",
        nextActionDate: tomorrow.toISOString(),
      }),
    );
  }

  const stageActions = STAGE_ACTIONS[entry.stage] ?? [];

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{contactLabel}</CardTitle>
          <Badge className={cn("shrink-0 text-xs", CRM_PRIORITY_COLORS[entry.priority])}>
            {CRM_PRIORITY_LABELS[entry.priority]}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {LEAD_SOURCE_LABELS[entry.lead.source]} · {LEAD_INTEREST_LABELS[entry.lead.interestType]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {CRM_STAGE_LABELS[entry.stage]}
          </Badge>
          <Badge className={cn("text-xs", urgencyColor(entry.urgencyLevel))}>
            {urgencyLabel(entry.urgencyLevel)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {entry.conversionLikelihood}% likely
          </Badge>
        </div>

        <div className="rounded-lg border border-border/50 bg-background/40 p-3 text-xs leading-5">
          <p className="font-medium text-foreground">What to do next</p>
          <p className="mt-1 text-muted-foreground">{entry.recommendedAction}</p>
          <p className="mt-2 text-muted-foreground">
            Next: {CRM_NEXT_ACTION_LABELS[entry.nextAction]} · {formatDate(entry.nextActionDate)}
          </p>
        </div>

        {entry.lead.campaignId ? (
          <p className="text-xs text-muted-foreground">Campaign origin linked</p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {entry.stage === "new" ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => runAction(() => markPipelineContactedAction(entry.id))}
            >
              <Phone />
              Contacted
            </Button>
          ) : null}
          {stageActions.map((action) => (
            <Button
              key={action.stage}
              type="button"
              size="sm"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => moveStage(action.stage)}
            >
              <ArrowRight />
              {action.label}
            </Button>
          ))}
          {entry.stage !== "converted" && entry.stage !== "lost" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => moveStage("lost")}
            >
              Lost
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isPending}
            onClick={scheduleTomorrow}
          >
            <Calendar />
            Follow-up
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isPending}
            onClick={() => setShowNotes((value) => !value)}
          >
            <StickyNote />
            Notes
          </Button>
        </div>

        {showNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add follow-up notes..."
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={saveNotes}
            >
              <Check />
              Save notes
            </Button>
          </div>
        ) : entry.notes ? (
          <p className="text-xs text-muted-foreground">
            <MessageSquare className="mr-1 inline size-3" />
            {entry.notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
