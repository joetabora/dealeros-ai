import { ClosingKitShell } from "@/components/closing-kit/closing-kit-shell";

export default function ProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClosingKitShell>{children}</ClosingKitShell>;
}
