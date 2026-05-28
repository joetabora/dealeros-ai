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
import {
  CONTENT_TYPE_LABELS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type ScheduledMarketingAction,
} from "@/types/scheduling";

type ScheduledActionCardProps = {
  action: ScheduledMarketingAction;
  campaignLabel?: string;
  demoMode?: boolean;
};

export function ScheduledActionCard({
  action,
  campaignLabel,
  demoMode = false,
}: ScheduledActionCardProps) {
  return (
    <Card className="border-border/60 bg-card/40">
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
                action.status === "pending"
                  ? "bg-primary/10 text-primary"
                  : undefined
              }
            >
              {demoMode ? "Simulated" : STATUS_LABELS[action.status]}
            </Badge>
          </div>
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
