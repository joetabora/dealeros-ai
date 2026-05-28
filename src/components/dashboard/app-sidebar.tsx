"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  dashboardNavigation,
  isPrimaryNavHref,
} from "@/config/navigation";
import { BrandMark } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Session } from "@/types/auth";
import { cn } from "@/lib/utils";

import { NavUser } from "./nav-user";

type AppSidebarProps = {
  session: Session;
};

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <BrandMark className="px-1 py-2" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2 pt-2">
            <Button
              size="lg"
              className="w-full justify-start shadow-sm"
              render={<Link href="/dashboard/marketing" />}
            >
              Generate Campaign
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {dashboardNavigation.map((section) => (
          <SidebarGroup key={section.label ?? section.items[0]?.href}>
            {section.label ? (
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));
                  const isPrimary = isPrimaryNavHref(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          isPrimary && !isActive && "font-medium",
                        )}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge ? (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "ml-auto text-[10px]",
                              item.badge === "Generate"
                                ? "bg-primary/20 text-primary"
                                : "bg-primary/15 text-primary",
                            )}
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
