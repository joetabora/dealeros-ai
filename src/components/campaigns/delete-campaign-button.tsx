"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteCampaignAction } from "@/lib/campaigns/actions";
import { Button } from "@/components/ui/button";

type DeleteCampaignButtonProps = {
  campaignId: string;
  redirectTo?: string;
};

export function DeleteCampaignButton({
  campaignId,
  redirectTo = "/dashboard/campaigns",
}: DeleteCampaignButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Delete this campaign? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCampaignAction(campaignId);
      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
