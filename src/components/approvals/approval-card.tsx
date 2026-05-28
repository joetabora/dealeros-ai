"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X, Zap } from "lucide-react";

import { ApprovalStatusBadge } from "@/components/approvals/approval-status-badge";
import { formatScheduledDisplay } from "@/lib/scheduling/constants";
import {
  approveItemAction,
  editItemAction,
  forceApproveAndExecuteAction,
  rejectItemAction,
} from "@/lib/approval-system/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTENT_TYPE_LABELS,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
} from "@/types/scheduling";
import type { MarketingApproval } from "@/types/approval";

type ApprovalCardProps = {
  approval: MarketingApproval;
  onUpdated?: () => void;
};

export function ApprovalCard({ approval, onUpdated }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(approval.contentSnapshot.content);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const contextLabel =
    approval.contentSnapshot.campaignLabel ??
    approval.contentSnapshot.eventName ??
    approval.dealershipName;

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setMessage(null);
      const result = await action();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setEditing(false);
      onUpdated?.();
    });
  }

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base">{contextLabel}</CardTitle>
            <CardDescription>
              {formatScheduledDisplay(approval.contentSnapshot.scheduledFor)} ·{" "}
              {approval.dealershipName}
            </CardDescription>
          </div>
          <ApprovalStatusBadge status={approval.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={PLATFORM_COLORS[approval.platform]}>
            {PLATFORM_LABELS[approval.platform]}
          </Badge>
          <Badge variant="secondary">
            {CONTENT_TYPE_LABELS[approval.contentSnapshot.contentType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            disabled={isPending}
          />
        ) : (
          <p
            className={
              expanded
                ? "text-sm leading-6 text-muted-foreground whitespace-pre-wrap"
                : "line-clamp-3 text-sm leading-6 text-muted-foreground whitespace-pre-wrap"
            }
          >
            {approval.contentSnapshot.content}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {!editing && approval.status === "pending" ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  runAction(() => approveItemAction(approval.id))
                }
              >
                <Check />
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => setEditing(true)}
              >
                <Pencil />
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() =>
                  runAction(() => rejectItemAction(approval.id))
                }
              >
                <X />
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() =>
                  runAction(() => forceApproveAndExecuteAction(approval.id))
                }
              >
                <Zap />
                Force send
              </Button>
            </>
          ) : null}

          {editing ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  runAction(() =>
                    editItemAction(approval.id, { content }),
                  )
                }
              >
                Save edits
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  setEditing(false);
                  setContent(approval.contentSnapshot.content);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Collapse" : "Preview full content"}
            </Button>
          )}
        </div>

        {message ? (
          <p className="text-sm text-destructive" role="alert">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
