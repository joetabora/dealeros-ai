import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}

type PlaceholderPanelProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PlaceholderPanel({
  title,
  description,
  children,
}: PlaceholderPanelProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
        <span className="size-2.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/60" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-sm">{siteConfig.name}</span>
          <span className="text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
            Operations
          </span>
        </span>
      ) : null}
    </Link>
  );
}
