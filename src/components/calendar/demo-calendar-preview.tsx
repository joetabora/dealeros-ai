"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarRange } from "lucide-react";

import { MarketingCalendarView } from "@/components/calendar/marketing-calendar-view";
import { previewDemoScheduleAction } from "@/lib/scheduling/demo-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEMO_DEALERSHIPS,
} from "@/config/demo-dealerships";
import type { ScheduledMarketingAction } from "@/types/scheduling";

type DemoCalendarPreviewProps = {
  initialDealershipId?: string;
};

export function DemoCalendarPreview({
  initialDealershipId,
}: DemoCalendarPreviewProps) {
  const [selectedId, setSelectedId] = useState(
    initialDealershipId ?? DEMO_DEALERSHIPS[0]!.id,
  );
  const [actions, setActions] = useState<ScheduledMarketingAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadPreview(dealershipId: string) {
    startTransition(async () => {
      setError(null);
      const result = await previewDemoScheduleAction(dealershipId);

      if (result.error || !result.actions) {
        setError(result.error ?? "Unable to load preview.");
        setActions([]);
        return;
      }

      setActions(result.actions);
    });
  }

  useEffect(() => {
    loadPreview(selectedId);
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge className="bg-primary/15 text-primary">Demo Preview</Badge>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Campaign Timeline Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            Simulated schedule — no posts are sent. See how marketing unfolds
            automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => loadPreview(selectedId)}
        >
          <CalendarRange />
          Refresh preview
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_DEALERSHIPS.map((dealer) => (
          <Button
            key={dealer.id}
            type="button"
            size="sm"
            variant={dealer.id === selectedId ? "default" : "secondary"}
            onClick={() => setSelectedId(dealer.id)}
          >
            {dealer.name}
          </Button>
        ))}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <MarketingCalendarView
        actions={actions}
        demoMode
        emptyMessage="Generating preview timeline..."
      />
    </div>
  );
}
