import { BrandMark } from "@/components/layout/page-shell";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <BrandMark />
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {siteConfig.tagline}
        </p>
      </div>
    </div>
  );
}
