"use client";

import { History } from "lucide-react";

import {
  getCampaignTypeLabel,
} from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AiGeneration } from "@/types/campaign";

type CampaignHistoryProps = {
  generations: AiGeneration[];
  activeId?: string;
  onSelect: (generation: AiGeneration) => void;
  className?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CampaignHistory({
  generations,
  activeId,
  onSelect,
  className,
}: CampaignHistoryProps) {
  return (
    <Card className={cn("border-border/60 bg-card/40", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <CardTitle className="text-base">Previous generations</CardTitle>
        </div>
        <CardDescription>
          Reopen saved campaign packages and copy what you need.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {generations.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground">
            No saved campaigns yet. Generate your first package to build history.
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] px-2 pb-4">
            <div className="space-y-2 px-2">
              {generations.map((generation) => {
                const isActive = generation.id === activeId;

                return (
                  <Button
                    key={generation.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onSelect(generation)}
                    className={cn(
                      "h-auto w-full flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left",
                      isActive
                        ? "border-primary/40 bg-primary/10 hover:bg-primary/10"
                        : "border-border/50 bg-background/30 hover:bg-background/60",
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="font-medium">{generation.dealershipName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(generation.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {getCampaignTypeLabel(generation.campaignType)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {generation.inputsJson.platform.toUpperCase()}
                      </Badge>
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
