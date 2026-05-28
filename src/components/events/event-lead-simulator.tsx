"use client";

import { useTransition } from "react";
import { UserPlus } from "lucide-react";

import { simulateEventLeadAction } from "@/lib/leads/actions";
import { Button } from "@/components/ui/button";

type EventLeadSimulatorProps = {
  eventId: string;
};

export function EventLeadSimulator({ eventId }: EventLeadSimulatorProps) {
  const [isPending, startTransition] = useTransition();

  function simulateRsvp() {
    startTransition(async () => {
      await simulateEventLeadAction(eventId);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={simulateRsvp}
    >
      <UserPlus />
      Simulate RSVP lead
    </Button>
  );
}
