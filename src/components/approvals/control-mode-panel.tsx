"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateControlModeAction } from "@/lib/approval-system/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CONTROL_MODE_DESCRIPTIONS,
  CONTROL_MODE_LABELS,
  CONTROL_MODES,
  type ControlMode,
} from "@/types/approval";

type ControlModePanelProps = {
  initialMode: ControlMode;
};

export function ControlModePanel({ initialMode }: ControlModePanelProps) {
  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(nextMode: ControlMode) {
    startTransition(async () => {
      setMessage(null);
      const result = await updateControlModeAction(nextMode);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMode(nextMode);
      setMessage("Control mode updated.");
    });
  }

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader>
        <CardTitle>Marketing Control Mode</CardTitle>
        <CardDescription>
          Choose how much automation your dealership allows before content goes live.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {CONTROL_MODES.map((option) => (
            <button
              key={option}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(option)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                mode === option
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/60 bg-background/30 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{CONTROL_MODE_LABELS[option]}</p>
                {mode === option ? (
                  <Badge className="bg-primary/15 text-primary">Active</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {CONTROL_MODE_DESCRIPTIONS[option]}
              </p>
            </button>
          ))}
        </div>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <Button type="button" variant="secondary" render={<Link href="/dashboard/approvals" />}>
          Open approval queue
        </Button>
      </CardContent>
    </Card>
  );
}
