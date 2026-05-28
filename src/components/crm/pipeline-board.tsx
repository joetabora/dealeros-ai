"use client";

import { PipelineCard } from "@/components/crm/pipeline-card";
import { Badge } from "@/components/ui/badge";
import { CRM_BOARD_STAGE_LABELS, type CrmBoardStage, type CrmPipelineWithLead } from "@/types/crm";

type PipelineBoardProps = {
  board: Record<CrmBoardStage | "lost", CrmPipelineWithLead[]>;
  onUpdated?: () => void;
};

const BOARD_COLUMNS: CrmBoardStage[] = [
  "new",
  "contacted",
  "qualified",
  "appointment_set",
  "converted",
];

export function PipelineBoard({ board, onUpdated }: PipelineBoardProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {BOARD_COLUMNS.map((stage) => (
            <section
              key={stage}
              className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-card/20 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{CRM_BOARD_STAGE_LABELS[stage]}</h3>
                <Badge variant="secondary">{board[stage].length}</Badge>
              </div>
              {board[stage].length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-8 text-center text-xs text-muted-foreground">
                  No leads in this stage
                </div>
              ) : (
                board[stage].map((entry) => (
                  <PipelineCard key={entry.id} entry={entry} onUpdated={onUpdated} />
                ))
              )}
            </section>
          ))}
        </div>
      </div>

      {board.lost.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Lost</h3>
            <Badge variant="secondary">{board.lost.length}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {board.lost.map((entry) => (
              <PipelineCard key={entry.id} entry={entry} onUpdated={onUpdated} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
