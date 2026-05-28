import { getSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClosingKitDemoShell } from "@/components/closing-kit/closing-kit-demo-shell";

type ClosingKitShellProps = {
  children: React.ReactNode;
};

export async function ClosingKitShell({ children }: ClosingKitShellProps) {
  const session = await getSession();

  if (session) {
    return <DashboardShell session={session}>{children}</DashboardShell>;
  }

  return <ClosingKitDemoShell>{children}</ClosingKitDemoShell>;
}
