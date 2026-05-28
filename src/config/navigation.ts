import {
  BarChart3,
  Bot,
  CalendarDays,
  CalendarRange,
  Handshake,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react";

import type { NavSection } from "@/types/navigation";

export const dashboardNavigation: NavSection[] = [
  {
    label: "Operations",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Pipeline health and daily performance",
      },
      {
        title: "Marketing",
        href: "/dashboard/marketing",
        icon: Rocket,
        description: "One-click full campaign generation — the core revenue engine",
        badge: "Core",
      },
      {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: CalendarRange,
        description: "Auto-scheduled marketing timeline across every channel",
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "ROI estimates, performance ranking, and what worked insights",
        badge: "Intel",
      },
      {
        title: "Autopilot",
        href: "/dashboard/autopilot",
        icon: Bot,
        description: "Self-improving recommendations and automatic weekly marketing plans",
        badge: "AI",
      },
      {
        title: "Live Demo",
        href: "/dashboard/demo",
        icon: Sparkles,
        description: "Instant sales demo — no setup required",
        badge: "Demo",
      },
      {
        title: "Closing Kit",
        href: "/dashboard/closing-kit",
        icon: Handshake,
        description: "ROI calculator, objections, and proposal generator",
        badge: "Sales",
      },
      {
        title: "Campaigns",
        href: "/dashboard/campaigns",
        icon: Megaphone,
        description: "Campaign history, AI generation, and saved marketing packages.",
      },
      {
        title: "Events",
        href: "/dashboard/events",
        icon: CalendarDays,
        description: "Shows, appointments, and activations",
      },
      {
        title: "Reactivation",
        href: "/dashboard/reactivation",
        icon: RefreshCw,
        description: "Win-back and dormant lead recovery",
        badge: "Live",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Team, integrations, and preferences",
      },
    ],
  },
];

export function getNavItemByHref(href: string) {
  for (const section of dashboardNavigation) {
    const item = section.items.find((entry) => entry.href === href);
    if (item) return item;
  }

  return undefined;
}
