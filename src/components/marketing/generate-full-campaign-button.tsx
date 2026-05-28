"use client";

import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateFullCampaignButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <Sparkles />
      {pending ? "Generating full campaign..." : "Generate Full Campaign"}
    </Button>
  );
}
