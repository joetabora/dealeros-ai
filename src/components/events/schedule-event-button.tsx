"use client";

import { useFormStatus } from "react-dom";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ScheduleEventButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <CalendarPlus />
      {pending ? "Scheduling event..." : "Schedule Event"}
    </Button>
  );
}
