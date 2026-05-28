"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type LoginSubmitButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export function LoginSubmitButton({
  idleLabel = "Continue to dashboard",
  pendingLabel = "Signing in...",
}: LoginSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
