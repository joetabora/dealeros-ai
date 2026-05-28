import { ClosingKitWorkspace } from "@/components/closing-kit/closing-kit-workspace";
import { PageContainer } from "@/components/layout/page-shell";
import { parseClosingKitSearchParams } from "@/lib/closing-kit/context";

export const metadata = {
  title: "Closing Kit",
};

type ClosingKitPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClosingKitPage({ searchParams }: ClosingKitPageProps) {
  const params = await searchParams;
  const context = parseClosingKitSearchParams(params);

  return (
    <PageContainer className="max-w-6xl">
      <ClosingKitWorkspace initialContext={context} />
    </PageContainer>
  );
}
