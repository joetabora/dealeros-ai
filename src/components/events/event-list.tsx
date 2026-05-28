import { CalendarDays } from "lucide-react";

import {
  formatEventDate,
  getEventTypeLabel,
} from "@/lib/events/validation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DealershipEvent } from "@/types/event";

type EventListProps = {
  events: DealershipEvent[];
  className?: string;
};

export function EventList({ events, className }: EventListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-sm text-muted-foreground">
          {events.length} scheduled event{events.length === 1 ? "" : "s"}
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/20">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <CalendarDays className="size-10 text-primary/60" />
            <div className="space-y-1">
              <h3 className="text-lg font-medium">No events scheduled yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Create your first dealership event using the form. It will appear
                here instantly and persist in Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="border-border/60 bg-card/40 transition-colors hover:border-primary/20 hover:bg-card/70"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{event.eventName}</CardTitle>
                  <CardDescription>{event.dealershipName}</CardDescription>
                </div>
                <span className="shrink-0 text-xs font-medium text-primary">
                  {formatEventDate(event.eventDate)}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary">
                  {getEventTypeLabel(event.eventType)}
                </Badge>
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
