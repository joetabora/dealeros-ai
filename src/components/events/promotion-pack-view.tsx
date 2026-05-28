"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";

import { CopyButton } from "@/components/campaigns/copy-button";
import { updatePromotionItemAction } from "@/lib/events/actions";
import {
  PROMOTION_PHASE_LABELS,
  PROMOTION_PLATFORM_LABELS,
  type DealershipEvent,
  type PromotionPackItem,
  type PromotionPhase,
} from "@/types/event";
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

const PHASE_ORDER: PromotionPhase[] = [
  "pre_event",
  "countdown",
  "day_of",
  "post_event",
];

type PromotionPackViewProps = {
  event: DealershipEvent;
};

export function PromotionPackView({ event }: PromotionPackViewProps) {
  const pack = event.promotionPack;

  if (!pack || pack.items.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card/20">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No promotion pack generated for this event yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {PHASE_ORDER.map((phase) => {
        const items = pack.items.filter((item) => item.phase === phase);
        if (items.length === 0) return null;

        return (
          <Card key={phase} className="border-border/60 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">
                {PROMOTION_PHASE_LABELS[phase]}
              </CardTitle>
              <CardDescription>
                {items.length} ready-to-send piece{items.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <PromotionItemCard
                  key={item.id}
                  eventId={event.id}
                  item={item}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

type PromotionItemCardProps = {
  eventId: string;
  item: PromotionPackItem;
};

function PromotionItemCard({ eventId, item }: PromotionItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const [content, setContent] = useState(item.content);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      setError(null);
      const result = await updatePromotionItemAction(eventId, item.id, draft);

      if (result.error) {
        setError(result.error);
        return;
      }

      setContent(draft);
      setIsEditing(false);
    });
  }

  function handleCancel() {
    setDraft(content);
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="font-medium">{item.label}</p>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {PROMOTION_PLATFORM_LABELS[item.platform]}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <CopyButton value={content} label="Copy" />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                <Pencil />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isPending}
              >
                <Check />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {isEditing ? (
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={8}
          disabled={isPending}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-card/30 p-4 text-sm leading-6 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}
