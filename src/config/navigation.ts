import {
  BarChart3,
  Bot,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Rocket,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import type { NavItem, NavSection } from "@/types/navigation";

export const coreNavigation: NavItem[] = [
  {
    title: "Campaigns",
    href: "/dashboard/marketing",
    icon: Rocket,
    description: "Generate full marketing in one click",
    badge: "Generate",
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
    description: "Shows, rides, and lot activations",
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: Users,
    description: "Contacts from campaigns and events",
  },
  {
    title: "Autopilot",
    href: "/dashboard/autopilot",
    icon: Bot,
    description: "Next best actions for your store",
    badge: "AI",
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your action hub — generate, review, and act",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarRange,
    description: "Auto-posting schedule across every channel",
  },
  {
    title: "What's Working",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "See what's driving results",
  },
  {
    title: "Live Demo",
    href: "/dashboard/demo",
    icon: Sparkles,
    description: "Try DealerOS with sample dealership data",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Team, billing, and preferences",
  },
];

export const dashboardNavigation: NavSection[] = [
  { label: "Main", items: coreNavigation },
  { label: "More", items: secondaryNavigation },
];

export function getNavItemByHref(href: string) {
  const allItems = [...coreNavigation, ...secondaryNavigation];

  for (const item of allItems) {
    if (item.href === href) return item;
  }

  for (const section of dashboardNavigation) {
    const item = section.items.find((entry) => entry.href === href);
    if (item) return item;
  }

  return undefined;
}

export function isPrimaryNavHref(href: string) {
  return coreNavigation.some((item) => item.href === href);
}
