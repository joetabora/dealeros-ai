import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { getLeadsDashboardAction } from "@/lib/leads/actions";

export default async function LeadsPage() {
  const result = await getLeadsDashboardAction();

  if (result.error || !result.leads || !result.summary) {
    return (
      <PageContainer>
        <PageHeader
          title="Leads"
          description="Structured contacts from marketing engagement — your revenue pipeline."
        />
        <p className="text-sm text-muted-foreground">
          {result.error ??
            "Unable to load leads. Confirm Supabase migration 20260527210000_leads.sql is applied."}
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description="Every campaign interaction becomes a structured lead — captured automatically, ready for follow-up and conversion."
      />
      <LeadsWorkspace leads={result.leads} summary={result.summary} />
    </PageContainer>
  );
}
