"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Kanban, Target } from "lucide-react";

import { PipelineBoard } from "@/components/crm/pipeline-board";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CrmBoardStage, CrmPipelineSummary, CrmPipelineWithLead } from "@/types/crm";

type CrmWorkspaceProps = {
  pipeline: CrmPipelineWithLead[];
  summary: CrmPipelineSummary;
  board: Record<CrmBoardStage | "lost", CrmPipelineWithLead[]>;
};

export function CrmWorkspace({ pipeline, summary, board }: CrmWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  const activeCount =
    summary.byStage.new +
    summary.byStage.contacted +
    summary.byStage.qualified +
    summary.byStage.appointment_set;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Sales Pipeline Active
          </CardTitle>
          <CardDescription>
            Every captured lead lands here automatically. Focus on what to do next
            to close — not CRM clutter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary">{activeCount} active</Badge>
            <Badge variant="secondary">{summary.dueToday} due today</Badge>
            <Badge className="bg-rose-500/15 text-rose-400">
              {summary.highPriority} high priority
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-400">
              {summary.conversionRate}% converted
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Pipeline total" value={String(summary.total)} />
        <SummaryStat label="New leads" value={String(summary.byStage.new)} />
        <SummaryStat label="Appointments set" value={String(summary.byStage.appointment_set)} />
        <SummaryStat label="Converted" value={String(summary.byStage.converted)} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Kanban className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Pipeline Board</h2>
            <p className="text-sm text-muted-foreground">
              Move leads through stages — each card tells you exactly what to do next.
            </p>
          </div>
        </div>

        {pipeline.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-card/20">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No pipeline entries yet. Capture leads from campaigns or use the lead
              simulators — CRM entries are created automatically.
            </CardContent>
          </Card>
        ) : (
          <PipelineBoard board={board} onUpdated={refresh} />
        )}
      </section>

      {isPending ? (
        <p className="text-xs text-muted-foreground">Updating pipeline...</p>
      ) : null}
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
