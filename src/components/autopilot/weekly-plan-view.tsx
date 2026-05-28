"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";

import { updateWeeklyPlanDayAction } from "@/lib/autopilot/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { WeeklyMarketingPlan, WeeklyPlanDay } from "@/types/autopilot";
import type { MarketingUrgencyLevel } from "@/types/marketing";
import type { ScheduledPlatform } from "@/types/scheduling";

const PLATFORMS: ScheduledPlatform[] = ["facebook", "instagram", "sms", "email"];
const URGENCY_LEVELS: MarketingUrgencyLevel[] = [
  "low",
  "medium",
  "high",
  "critical",
];

type WeeklyPlanViewProps = {
  initialPlan: WeeklyMarketingPlan;
};

export function WeeklyPlanView({ initialPlan }: WeeklyPlanViewProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(day: WeeklyPlanDay, theme: string, urgency: MarketingUrgencyLevel) {
    startTransition(async () => {
      const result = await updateWeeklyPlanDayAction(day.id, {
        contentTheme: theme,
        urgencyLevel: urgency,
        platforms: day.platforms,
      });

      if (result.dashboard) {
        setPlan(result.dashboard.weeklyPlan);
      }

      setEditingDayId(null);
    });
  }

  function togglePlatform(day: WeeklyPlanDay, platform: ScheduledPlatform) {
    const platforms = day.platforms.includes(platform)
      ? day.platforms.filter((entry) => entry !== platform)
      : [...day.platforms, platform];

    startTransition(async () => {
      const result = await updateWeeklyPlanDayAction(day.id, { platforms });
      if (result.dashboard) {
        setPlan(result.dashboard.weeklyPlan);
      }
    });
  }

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Weekly Marketing Plan</CardTitle>
          <CardDescription>
            Auto-generated 7-day plan starting {plan.weekStart}. Edit themes and
            urgency as needed.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">FB {plan.platformBreakdown.facebook}</Badge>
          <Badge variant="secondary">IG {plan.platformBreakdown.instagram}</Badge>
          <Badge variant="secondary">SMS {plan.platformBreakdown.sms}</Badge>
          <Badge variant="secondary">Email {plan.platformBreakdown.email}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.days.map((day) => (
          <DayRow
            key={day.id}
            day={day}
            isEditing={editingDayId === day.id}
            isPending={isPending}
            onEdit={() => setEditingDayId(day.id)}
            onCancel={() => setEditingDayId(null)}
            onSave={handleSave}
            onTogglePlatform={togglePlatform}
          />
        ))}
      </CardContent>
    </Card>
  );
}

type DayRowProps = {
  day: WeeklyPlanDay;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (day: WeeklyPlanDay, theme: string, urgency: MarketingUrgencyLevel) => void;
  onTogglePlatform: (day: WeeklyPlanDay, platform: ScheduledPlatform) => void;
};

function DayRow({
  day,
  isEditing,
  isPending,
  onEdit,
  onCancel,
  onSave,
  onTogglePlatform,
}: DayRowProps) {
  const [theme, setTheme] = useState(day.contentTheme);
  const [urgency, setUrgency] = useState(day.urgencyLevel);

  return (
    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{day.dayLabel}</p>
            {day.campaignType !== "rest" ? (
              <Badge variant="secondary" className="capitalize">
                {day.campaignType}
              </Badge>
            ) : (
              <Badge variant="secondary">Light day</Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {day.urgencyLevel} urgency
            </Badge>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                disabled={isPending}
              />
              <div className="flex flex-wrap gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={urgency === level ? "default" : "secondary"}
                    disabled={isPending}
                    onClick={() => setUrgency(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">{day.contentTheme}</p>
              <p className="text-sm text-muted-foreground">{day.expectedOutcome}</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => onSave(day, theme, urgency)}
              >
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={onCancel}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <Button
            key={platform}
            type="button"
            size="sm"
            variant={day.platforms.includes(platform) ? "default" : "secondary"}
            disabled={isPending}
            onClick={() => onTogglePlatform(day, platform)}
          >
            {platform}
          </Button>
        ))}
      </div>
    </div>
  );
}
