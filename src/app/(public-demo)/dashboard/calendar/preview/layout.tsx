import { DemoShell } from "@/components/demo/demo-shell";

export default function CalendarPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoShell>{children}</DemoShell>;
}
