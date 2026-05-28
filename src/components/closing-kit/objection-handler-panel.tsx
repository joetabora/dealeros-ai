"use client";

import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

import { DEALER_OBJECTIONS } from "@/config/closing-kit";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ObjectionHandlerPanel() {
  const [openId, setOpenId] = useState(DEALER_OBJECTIONS[0]!.id);

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="size-5 text-primary" />
          <CardTitle>Common Dealer Questions</CardTitle>
        </div>
        <CardDescription>
          Tap a question. Read the answer out loud. Close with confidence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {DEALER_OBJECTIONS.map((objection) => {
          const isOpen = openId === objection.id;

          return (
            <div
              key={objection.id}
              className="overflow-hidden rounded-xl border border-border/60 bg-background/40"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? "" : objection.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-medium">{objection.question}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen ? (
                <div className="space-y-3 border-t border-border/60 px-4 py-4">
                  <p className="font-semibold text-primary">{objection.headline}</p>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {objection.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
