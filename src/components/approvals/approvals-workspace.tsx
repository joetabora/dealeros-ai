"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ShieldCheck } from "lucide-react";

import { ApprovalCard } from "@/components/approvals/approval-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CONTROL_MODE_DESCRIPTIONS,
  CONTROL_MODE_LABELS,
  type ApprovalAuditEntry,
  type ControlMode,
  type MarketingApproval,
} from "@/types/approval";

type ApprovalsWorkspaceProps = {
  pending: MarketingApproval[];
  recent: MarketingApproval[];
  auditLog: ApprovalAuditEntry[];
  controlMode: ControlMode;
};

export function ApprovalsWorkspace({
  pending,
  recent,
  auditLog,
  controlMode,
}: ApprovalsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Human Control Active
          </CardTitle>
          <CardDescription>
            AI does the work, but you stay in control. Current mode:{" "}
            <strong>{CONTROL_MODE_LABELS[controlMode]}</strong> —{" "}
            {CONTROL_MODE_DESCRIPTIONS[controlMode]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{pending.length} pending review</Badge>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review, edit, approve, or reject before anything goes live.
          </p>
        </div>
        {pending.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-card/20">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No items waiting for approval. Generate a campaign to see content here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pending.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onUpdated={refresh}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Decisions</h2>
          <p className="text-sm text-muted-foreground">
            Approved, edited, and rejected items from your queue.
          </p>
        </div>
        <div className="grid gap-3">
          {recent
            .filter((item) => item.status !== "pending")
            .slice(0, 8)
            .map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Who approved, what changed, and when actions were taken.
          </p>
        </div>
        <Card className="border-border/60 bg-card/40">
          <CardContent className="divide-y divide-border/60 p-0">
            {auditLog.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Audit entries appear as you approve, edit, or reject content.
              </p>
            ) : (
              auditLog.map((entry) => (
                <div key={entry.id} className="space-y-1 p-4 text-sm">
                  <p className="font-medium capitalize">
                    {entry.action.replace(/_/g, " ")} · {entry.dealershipName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()} · {entry.actorLabel}
                  </p>
                  {entry.originalContent && entry.updatedContent &&
                  entry.originalContent !== entry.updatedContent ? (
                    <p className="text-xs text-muted-foreground">
                      Content edited before approval.
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
