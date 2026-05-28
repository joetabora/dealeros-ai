"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type GenerateSubmitButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export function GenerateSubmitButton({
  idleLabel = "Generate campaign",
  pendingLabel = "Generating...",
}: GenerateSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
