"use client";

import { useActionState, useEffect, useState } from "react";

import { EventForm } from "@/components/events/event-form";
import { EventList } from "@/components/events/event-list";
import { ScheduleEventButton } from "@/components/events/schedule-event-button";
import { createEventAction } from "@/lib/events/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DealershipEvent, EventFormState } from "@/types/event";

const initialState: EventFormState = {};

type EventsWorkspaceProps = {
  initialEvents: DealershipEvent[];
  dealershipName: string;
};

export function EventsWorkspace({
  initialEvents,
  dealershipName,
}: EventsWorkspaceProps) {
  const [events, setEvents] = useState(initialEvents);
  const [formKey, setFormKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [state, formAction] = useActionState(createEventAction, initialState);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (state.event) {
      setEvents((current) => [
        state.event!,
        ...current.filter((event) => event.id !== state.event!.id),
      ]);
      setFormKey((current) => current + 1);
      setSuccessMessage(`"${state.event.eventName}" is on the calendar.`);
    }
  }, [state.event]);

  useEffect(() => {
    if (state.error) {
      setSuccessMessage(null);
    }
  }, [state.error]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="border-border/60 bg-card/50 xl:sticky xl:top-20 xl:self-start">
        <CardHeader>
          <CardTitle>Schedule Event</CardTitle>
          <CardDescription>
            Plan activations for {dealershipName}. Events save to your account
            and show up in the list immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form key={formKey} action={formAction} className="space-y-5">
            <EventForm />

            {state.error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {state.error}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              >
                {successMessage}
              </div>
            ) : null}

            <ScheduleEventButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Upcoming events</h2>
          <p className="text-sm text-muted-foreground">
            Newest events first — sorted by event date.
          </p>
        </div>
        <EventList events={events} />
      </div>
    </div>
  );
}
