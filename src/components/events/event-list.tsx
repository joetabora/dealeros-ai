import Link from "next/link";
import { CalendarDays, Megaphone } from "lucide-react";

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
                Schedule an event and DealerOS instantly builds a full promotion
                pack — pre-event, countdown, day-of, and follow-up content.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => {
            const promotionCount = event.promotionPack?.items.length ?? 0;

            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="block"
              >
                <Card className="border-border/60 bg-card/40 transition-colors hover:border-primary/30 hover:bg-card/70">
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
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {getEventTypeLabel(event.eventType)}
                      </Badge>
                      {promotionCount > 0 ? (
                        <Badge className="bg-primary/15 text-primary">
                          <Megaphone className="mr-1 size-3" />
                          {promotionCount} promotions
                        </Badge>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
