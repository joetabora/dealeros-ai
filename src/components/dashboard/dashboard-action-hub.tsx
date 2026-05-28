import Link from "next/link";
import { ArrowUpRight, CalendarClock, Rocket, Users } from "lucide-react";

import { ConversionPrompt } from "@/components/conversion/conversion-prompt";
import { ValueMomentBanner } from "@/components/conversion/value-moment";
import { shouldShowConversionPrompt } from "@/lib/conversion/funnel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DealershipLead } from "@/types/leads";
import type { MarketingCampaign } from "@/types/marketing";
import type { OnboardingState } from "@/types/onboarding";
import type { ScheduledMarketingAction } from "@/types/scheduling";

type DashboardActionHubProps = {
  campaigns: MarketingCampaign[];
  upcomingActions: ScheduledMarketingAction[];
  recentLeads: DealershipLead[];
  onboarding: OnboardingState;
};

function formatScheduleDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DashboardActionHub({
  campaigns,
  upcomingActions,
  recentLeads,
  onboarding,
}: DashboardActionHubProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-card/40">
        <CardHeader>
          <CardTitle className="text-2xl">What do you want to do next?</CardTitle>
          <CardDescription>
            Generate a full campaign — social, SMS, email, and schedule — in one
            click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" render={<Link href="/dashboard/marketing" />}>
            <Rocket />
            Generate Campaign
          </Button>
        </CardContent>
      </Card>

      {onboarding.valueMomentsSeen.includes("onboarding_complete") &&
      !onboarding.valueMomentsSeen.includes("first_campaign") ? (
        <ValueMomentBanner momentKey="first_campaign" alreadySeen={false} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/50 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent campaigns</CardTitle>
              <CardDescription>Your latest generated marketing</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/marketing" />}>
              View all
              <ArrowUpRight />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No campaigns yet. Hit Generate Campaign to create your first pack.
              </p>
            ) : (
              campaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
                >
                  <p className="text-sm font-medium">{campaign.eventOrOfferName}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {campaign.campaignType.replace("_", " ")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Upcoming scheduled actions</CardTitle>
              <CardDescription>Your auto-posting timeline</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/calendar" />}>
              Calendar
              <CalendarClock />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Scheduled posts appear here after you generate a campaign.
              </p>
            ) : (
              upcomingActions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium capitalize">
                      {action.platform} · {action.contentType.replace("_", " ")}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {action.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatScheduleDate(action.scheduledFor)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">New leads</CardTitle>
              <CardDescription>Contacts ready for follow-up</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/leads" />}>
              Open leads
              <Users />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Leads from campaigns and events show up here automatically.
              </p>
            ) : (
              recentLeads.slice(0, 3).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
                >
                  <p className="text-sm font-medium">{lead.name ?? "New lead"}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {lead.source} · {lead.interestType}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {shouldShowConversionPrompt(onboarding.funnelStage) ? (
        <ConversionPrompt variant="dashboard" />
      ) : null}
    </div>
  );
}
