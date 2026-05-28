import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";

import { PromotionPackView } from "@/components/events/promotion-pack-view";
import { PageHeader } from "@/components/layout/page-shell";
import {
  formatEventDate,
  getEventTypeLabel,
} from "@/lib/events/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DealershipEvent } from "@/types/event";

type EventDetailViewProps = {
  event: DealershipEvent;
};

export function EventDetailView({ event }: EventDetailViewProps) {
  const promotionCount = event.promotionPack?.items.length ?? 0;

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href="/dashboard/events" />}
      >
        <ArrowLeft />
        Back to events
      </Button>

      <PageHeader
        title={event.eventName}
        description={`${event.dealershipName} · ${formatEventDate(event.eventDate)}`}
      />

      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Event Overview</CardTitle>
          <CardDescription>
            Your event and the full promotion pack generated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <OverviewField label="Event name" value={event.eventName} />
            <OverviewField
              label="Event date"
              value={formatEventDate(event.eventDate)}
            />
            <OverviewField
              label="Event type"
              value={getEventTypeLabel(event.eventType)}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Description</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {event.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getEventTypeLabel(event.eventType)}
            </Badge>
            {promotionCount > 0 ? (
              <Badge className="bg-primary/15 text-primary">
                <Megaphone className="mr-1 size-3" />
                {promotionCount} promotion assets ready
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Promotion Pack</h2>
          <p className="text-sm text-muted-foreground">
            Full revenue-driving campaign sequence — pre-event, countdown, day-of,
            and post-event follow-up.
          </p>
        </div>
        <PromotionPackView event={event} />
      </section>
    </div>
  );
}

type OverviewFieldProps = {
  label: string;
  value: string;
};

function OverviewField({ label, value }: OverviewFieldProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
