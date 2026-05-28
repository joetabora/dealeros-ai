"use client";

import { useEffect, useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";

import { markValueMomentSeenAction } from "@/lib/onboarding/actions";
import {
  getValueMoment,
  type ValueMomentKey,
} from "@/lib/conversion/value-moments";
import { Button } from "@/components/ui/button";

type ValueMomentBannerProps = {
  momentKey: ValueMomentKey;
  alreadySeen: boolean;
};

export function ValueMomentBanner({
  momentKey,
  alreadySeen,
}: ValueMomentBannerProps) {
  const [visible, setVisible] = useState(!alreadySeen);
  const [, startTransition] = useTransition();
  const moment = getValueMoment(momentKey);

  useEffect(() => {
    if (!visible || alreadySeen) return;

    startTransition(async () => {
      await markValueMomentSeenAction(momentKey);
    });
  }, [visible, alreadySeen, momentKey]);

  if (!visible || alreadySeen) {
    return null;
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">{moment.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{moment.message}</p>
          </div>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
