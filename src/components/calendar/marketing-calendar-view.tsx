import { CalendarRange } from "lucide-react";

import { ScheduledActionCard } from "@/components/calendar/scheduled-action-card";
import { groupActionsByDate } from "@/lib/scheduling/timing-engine";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { ScheduledMarketingAction } from "@/types/scheduling";

type MarketingCalendarViewProps = {
  actions: ScheduledMarketingAction[];
  demoMode?: boolean;
  emptyMessage?: string;
};

export function MarketingCalendarView({
  actions,
  demoMode = false,
  emptyMessage = "Scheduled marketing actions will appear here after you generate a campaign, schedule an event, or run the one-click marketing engine.",
}: MarketingCalendarViewProps) {
  const groups = groupActionsByDate(actions);

  if (groups.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card/20">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <CalendarRange className="size-10 text-primary/60" />
          <div className="space-y-1">
            <h3 className="text-lg font-medium">No scheduled actions yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.dateKey} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{group.dateLabel}</h2>
            <p className="text-sm text-muted-foreground">
              {group.actions.length} scheduled action
              {group.actions.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-3">
            {group.actions.map((action) => (
              <ScheduledActionCard
                key={action.id}
                action={action}
                demoMode={demoMode}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
