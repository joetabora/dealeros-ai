import Link from "next/link";

import { ProposalSnapshotView } from "@/components/closing-kit/proposal-snapshot-view";
import { PageContainer } from "@/components/layout/page-shell";
import { getProposal } from "@/lib/closing-kit/proposal-store";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dealership Snapshot",
};

type ProposalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params;
  const proposal = await getProposal(id);

  if (!proposal) {
    return (
      <PageContainer className="max-w-4xl">
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <p className="font-medium">Proposal not found</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Generate a new proposal from the Closing Kit. Proposals are stored in
            your session for seven days.
          </p>
          <Button render={<Link href="/dashboard/closing-kit" />}>
            Go to Closing Kit
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl print:max-w-none print:p-0">
      <ProposalSnapshotView proposal={proposal} />
    </PageContainer>
  );
}
