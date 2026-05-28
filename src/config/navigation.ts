import {
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
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
        title: "Live Demo",
        href: "/dashboard/demo",
        icon: Sparkles,
        description: "Instant sales demo — no setup required",
        badge: "Demo",
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
