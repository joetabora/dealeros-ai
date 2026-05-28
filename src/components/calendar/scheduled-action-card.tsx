import { CopyButton } from "@/components/campaigns/copy-button";
import { formatScheduledDisplay } from "@/lib/scheduling/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CONTENT_TYPE_LABELS,
  EXECUTION_STATUS_LABELS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type ScheduledMarketingAction,
} from "@/types/scheduling";

type ScheduledActionCardProps = {
  action: ScheduledMarketingAction;
  campaignLabel?: string;
  demoMode?: boolean;
  simulated?: boolean;
};

export function ScheduledActionCard({
  action,
  campaignLabel,
  demoMode = false,
  simulated = false,
}: ScheduledActionCardProps) {
  const displayStatus = simulated ? "sent" : action.status;
  const isSent = displayStatus === "sent";

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/40 transition-all",
        isSent && "border-emerald-500/30 bg-emerald-500/5",
        displayStatus === "failed" && "border-destructive/30 bg-destructive/5",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base">
            {formatScheduledDisplay(action.scheduledFor)}
          </CardTitle>
          <CardDescription>
            {campaignLabel ?? action.dealershipName}
            {action.eventId ? " · Event campaign" : action.campaignId ? " · Campaign" : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-2">
            <Badge className={PLATFORM_COLORS[action.platform]}>
              {PLATFORM_LABELS[action.platform]}
            </Badge>
            <Badge variant="secondary">
              {CONTENT_TYPE_LABELS[action.contentType]}
            </Badge>
            <Badge
              variant="secondary"
              className={
                displayStatus === "pending"
                  ? "bg-primary/10 text-primary"
                  : displayStatus === "sent"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : displayStatus === "failed"
                      ? "bg-destructive/15 text-destructive"
                      : undefined
              }
            >
              {demoMode && simulated
                ? "Simulated sent"
                : STATUS_LABELS[displayStatus]}
            </Badge>
            {!demoMode && action.executionStatus !== action.status ? (
              <Badge variant="secondary">
                Exec: {EXECUTION_STATUS_LABELS[action.executionStatus]}
              </Badge>
            ) : null}
          </div>
          {action.executedAt ? (
            <p className="text-xs text-muted-foreground">
              Executed {formatScheduledDisplay(action.executedAt)}
              {action.providerResponse?.simulated ? " · Simulated" : ""}
            </p>
          ) : null}
        </div>
        <CopyButton value={action.content} label="Copy" />
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
          {action.content}
        </p>
      </CardContent>
    </Card>
  );
}
