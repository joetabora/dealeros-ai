import { ArrowUpRight, CalendarDays, Megaphone, RefreshCw } from "lucide-react";

import { PageContainer, PageHeader, PlaceholderPanel } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Active campaigns",
    value: "12",
    change: "+2 this week",
  },
  {
    label: "Reactivation queue",
    value: "847",
    change: "312 high intent",
  },
  {
    label: "Events this month",
    value: "6",
    change: "2 launching soon",
  },
  {
    label: "Response rate",
    value: "34%",
    change: "+6.2% vs last month",
  },
];

const quickActions = [
  {
    title: "Launch campaign",
    description: "Spin up a new outbound sequence",
    icon: Megaphone,
  },
  {
    title: "Schedule event",
    description: "Plan a show or appointment drive",
    icon: CalendarDays,
  },
  {
    title: "Run reactivation",
    description: "Recover dormant leads with AI playbooks",
    icon: RefreshCw,
  },
];

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Monitor pipeline health, campaign performance, and reactivation opportunities across your dealership."
        actions={
          <Button>
            New campaign
            <ArrowUpRight />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/60 bg-card/50 shadow-sm backdrop-blur-sm"
          >
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tracking-tight">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PlaceholderPanel
          title="Operational feed"
          description="Recent campaign activity, event registrations, and reactivation wins will appear here."
        >
          <div className="space-y-3">
            {[
              "Reactivation batch #42 completed — 18 appointments booked",
              "Spring service event registrations up 24% week-over-week",
              "AI follow-up sequence paused for compliance review",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border/50 bg-background/40 px-4 py-3 text-sm text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </PlaceholderPanel>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Quick actions</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              AI ready
            </Badge>
          </div>
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="border-border/60 bg-card/40 transition-colors hover:border-primary/30 hover:bg-card/70"
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <action.icon className="size-4" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-sm">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
