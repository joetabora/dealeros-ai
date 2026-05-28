"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MessageSquare, MousePointerClick, Users } from "lucide-react";

import { LeadCard } from "@/components/leads/lead-card";
import {
  simulateEmailLeadAction,
  simulateSmsLeadAction,
} from "@/lib/leads/actions";
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
  LEAD_SOURCE_LABELS,
  type DealershipLead,
  type LeadSummary,
} from "@/types/leads";

type LeadsWorkspaceProps = {
  leads: DealershipLead[];
  summary: LeadSummary;
};

export function LeadsWorkspace({ leads, summary }: LeadsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  function simulateSms(keyword: string) {
    startTransition(async () => {
      await simulateSmsLeadAction(keyword);
      refresh();
    });
  }

  function simulateEmail() {
    startTransition(async () => {
      await simulateEmailLeadAction();
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Lead Capture Active
          </CardTitle>
          <CardDescription>
            Marketing engagement automatically converts into structured leads.
            Every campaign CTA, SMS reply, email click, and event RSVP feeds this
            pipeline in the background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary">{summary.total} total</Badge>
            <Badge variant="secondary">{summary.new} new</Badge>
            <Badge variant="secondary">{summary.contacted} contacted</Badge>
            <Badge className="bg-emerald-500/15 text-emerald-400">
              {summary.converted} converted
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Total leads" value={String(summary.total)} />
        <SummaryStat label="New" value={String(summary.new)} />
        <SummaryStat label="Contacted" value={String(summary.contacted)} />
        <SummaryStat label="Converted" value={String(summary.converted)} />
      </div>

      <Card className="border-border/60 bg-card/40">
        <CardHeader>
          <CardTitle className="text-base">Lead sources</CardTitle>
          <CardDescription>
            Where your dealership contacts are coming from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.bySource).map(([source, count]) => (
              <Badge key={source} variant="secondary">
                {LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS]} · {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-border/70 bg-card/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4" />
            Simulate engagement (V1)
          </CardTitle>
          <CardDescription>
            Test the lead pipeline — execution also captures leads automatically
            after sends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => simulateSms("YES")}
          >
            SMS: YES
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => simulateSms("INFO")}
          >
            SMS: INFO
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => simulateSms("BOOK")}
          >
            SMS: BOOK
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={simulateEmail}
          >
            <MousePointerClick />
            Email CTA click
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">All leads</h2>
          <p className="text-sm text-muted-foreground">
            Review, follow up, and track conversion from marketing engagement.
          </p>
        </div>
        {leads.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-card/20">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No leads captured yet. Run a campaign, execute scheduled actions, or
              use the simulators above to populate your pipeline.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onUpdated={refresh} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
