import Link from "next/link";
import { Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DemoShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DemoShell({ children, className }: DemoShellProps) {
  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/dashboard/demo" className="flex items-center gap-2.5 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Sparkles className="size-4 text-primary" />
            </span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Live Demo
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/dashboard/campaigns/new" />}>
              Go to app
            </Button>
          </div>
        </div>
      </header>
      <main className={cn("mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10", className)}>
        {children}
      </main>
    </div>
  );
}
