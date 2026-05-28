"use client";

import { useMemo, useState, useTransition } from "react";
import { Play, Sparkles } from "lucide-react";

import { MarketingCalendarView } from "@/components/calendar/marketing-calendar-view";
import {
  runExecutionForUserAction,
  simulateExecutionForUserAction,
} from "@/lib/execution-engine/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScheduledMarketingAction, ScheduledStatus } from "@/types/scheduling";

type CalendarWorkspaceProps = {
  initialActions: ScheduledMarketingAction[];
};

type FilterStatus = "all" | ScheduledStatus;

export function CalendarWorkspace({ initialActions }: CalendarWorkspaceProps) {
  const [actions, setActions] = useState(initialActions);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    return {
      pending: actions.filter((action) => action.status === "pending").length,
      sent: actions.filter((action) => action.status === "sent").length,
      failed: actions.filter((action) => action.status === "failed").length,
    };
  }, [actions]);

  const filteredActions = useMemo(() => {
    if (filter === "all") return actions;
    return actions.filter((action) => action.status === filter);
  }, [actions, filter]);

  function handleRunExecution(simulate: boolean) {
    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = simulate
        ? await simulateExecutionForUserAction()
        : await runExecutionForUserAction();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.summary) {
        setMessage(
          simulate
            ? `Simulated ${result.summary.sent} post${result.summary.sent === 1 ? "" : "s"} going live.`
            : `Executed ${result.summary.sent} action${result.summary.sent === 1 ? "" : "s"}${result.summary.failed ? ` · ${result.summary.failed} failed` : ""}.`,
        );
      }

      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Execution Layer</CardTitle>
            <CardDescription>
              Scheduled actions auto-route to Meta, SMS, and email providers when
              due — or simulate instantly in demo mode.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleRunExecution(false)}
            >
              <Play />
              Run due posts
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => handleRunExecution(true)}
            >
              <Sparkles />
              Simulate all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Pending" value={stats.pending} />
            <Stat label="Sent" value={stats.sent} />
            <Stat label="Failed" value={stats.failed} />
          </div>
        </CardContent>
      </Card>

      {message ? (
        <div
          role="status"
          className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All ({actions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({stats.sent})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <MarketingCalendarView actions={filteredActions} />
    </div>
  );
}

type StatProps = {
  label: string;
  value: number;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
