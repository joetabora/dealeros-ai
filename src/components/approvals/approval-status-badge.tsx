import { Badge } from "@/components/ui/badge";
import {
  APPROVAL_STATUS_COLORS,
  APPROVAL_STATUS_LABELS,
  type ApprovalStatus,
} from "@/types/approval";

type ApprovalStatusBadgeProps = {
  status?: ApprovalStatus | null;
  scheduled?: boolean;
};

export function ApprovalStatusBadge({
  status,
  scheduled = false,
}: ApprovalStatusBadgeProps) {
  if (!status) {
    if (scheduled) {
      return (
        <Badge variant="secondary" className="bg-blue-500/15 text-blue-400">
          Scheduled
        </Badge>
      );
    }
    return null;
  }

  return (
    <Badge variant="secondary" className={APPROVAL_STATUS_COLORS[status]}>
      {APPROVAL_STATUS_LABELS[status]}
    </Badge>
  );
}
