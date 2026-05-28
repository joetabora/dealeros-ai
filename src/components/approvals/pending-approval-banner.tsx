import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type PendingApprovalBannerProps = {
  count: number;
};

export function PendingApprovalBanner({ count }: PendingApprovalBannerProps) {
  if (count <= 0) return null;

  return (
    <Card className="border-amber-500/25 bg-amber-500/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-amber-400" />
          <div>
            <p className="font-medium">Human approval required</p>
            <p className="text-sm text-muted-foreground">
              {count} marketing item{count === 1 ? "" : "s"} waiting for your review
              before scheduling or execution.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{count} pending</Badge>
          <Button size="sm" render={<Link href="/dashboard/approvals" />}>
            Open approvals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
