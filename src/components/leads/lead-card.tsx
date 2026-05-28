"use client";

import { useTransition } from "react";
import { Check, Phone, UserCheck, X } from "lucide-react";

import { updateLeadStatusAction } from "@/lib/leads/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LEAD_INTEREST_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  type DealershipLead,
  type LeadStatus,
} from "@/types/leads";

type LeadCardProps = {
  lead: DealershipLead;
  onUpdated?: () => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LeadCard({ lead, onUpdated }: LeadCardProps) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: LeadStatus) {
    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, status);
      if (!result.error) {
        onUpdated?.();
      }
    });
  }

  const contactLabel =
    lead.name ?? lead.phone ?? lead.email ?? "Unknown contact";

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base">{contactLabel}</CardTitle>
          <CardDescription>
            {lead.dealershipName} · Captured {formatDate(lead.createdAt)}
          </CardDescription>
        </div>
        <Badge className={cn("shrink-0", LEAD_STATUS_COLORS[lead.status])}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
          <Badge variant="outline">{LEAD_INTEREST_LABELS[lead.interestType]}</Badge>
          {lead.campaignId ? (
            <Badge variant="outline" className="font-mono text-xs">
              Campaign linked
            </Badge>
          ) : null}
          {lead.eventId ? (
            <Badge variant="outline" className="font-mono text-xs">
              Event linked
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {lead.phone ? (
            <p>
              <span className="text-muted-foreground">Phone:</span> {lead.phone}
            </p>
          ) : null}
          {lead.email ? (
            <p>
              <span className="text-muted-foreground">Email:</span> {lead.email}
            </p>
          ) : null}
          {lead.lastContactedAt ? (
            <p className="sm:col-span-2 text-muted-foreground">
              Last contacted {formatDate(lead.lastContactedAt)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {lead.status === "new" ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => updateStatus("contacted")}
            >
              <Phone />
              Mark contacted
            </Button>
          ) : null}
          {lead.status !== "converted" ? (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => updateStatus("converted")}
            >
              <Check />
              Mark converted
            </Button>
          ) : null}
          {lead.status !== "lost" && lead.status !== "converted" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => updateStatus("lost")}
            >
              <X />
              Mark lost
            </Button>
          ) : null}
          {lead.status === "contacted" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => updateStatus("new")}
            >
              <UserCheck />
              Reset to new
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
