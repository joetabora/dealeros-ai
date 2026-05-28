"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SaveCampaignButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Saving..." : "Save campaign"}
    </Button>
  );
}
