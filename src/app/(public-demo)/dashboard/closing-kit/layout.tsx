import { ClosingKitShell } from "@/components/closing-kit/closing-kit-shell";

export default function ClosingKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClosingKitShell>{children}</ClosingKitShell>;
}
