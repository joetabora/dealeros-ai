"use client";

import { Bell, Search } from "lucide-react";

import { getNavItemByHref } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Session } from "@/types/auth";

type DashboardHeaderProps = {
  session: Session;
  pathname: string;
};

export function DashboardHeader({ session, pathname }: DashboardHeaderProps) {
  const currentNav = getNavItemByHref(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="hidden h-4 sm:block" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {currentNav?.title ?? "Dashboard"}
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {session.dealer.name}
          {currentNav?.description ? ` · ${currentNav.description}` : ""}
        </p>
      </div>

      <div className="hidden max-w-sm flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns, leads, events..."
            className="h-9 border-border/60 bg-card/40 pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
        </Button>
      </div>
    </header>
  );
}
