"use client";

import Link from "next/link";
import { History } from "lucide-react";

import {
  getCampaignTypeLabel,
} from "@/lib/campaigns/validation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";

type CampaignHistoryProps = {
  generations: Campaign[];
  activeId?: string;
  onSelect: (generation: Campaign) => void;
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
          Reopen saved campaign packages and copy what you need.{" "}
          <Link href="/dashboard/campaigns" className="text-primary hover:underline">
            View all history
          </Link>
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
                  <div
                    key={generation.id}
                    className={cn(
                      "rounded-xl border px-3 py-3 transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/50 bg-background/30 hover:bg-background/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(generation)}
                      className="w-full text-left"
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="font-medium">{generation.dealershipName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(generation.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
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
                    </button>
                    <Link
                      href={`/dashboard/campaigns/${generation.id}`}
                      className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                      Open detail
                    </Link>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
