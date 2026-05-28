import { createClient } from "@/lib/supabase/server";
import { clampPageSize } from "@/lib/tenant/scoped-query";
import type {
  DealershipLead,
  LeadCaptureInput,
  LeadInterestType,
  LeadSource,
  LeadStatus,
  LeadSummary,
} from "@/types/leads";

type LeadRow = {
  id: string;
  user_id: string;
  dealership_name: string;
  campaign_id: string | null;
  event_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  interest_type: string;
  status: string;
  created_at: string;
  last_contacted_at: string | null;
};

function mapRow(row: LeadRow): DealershipLead {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    campaignId: row.campaign_id,
    eventId: row.event_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    source: row.source as LeadSource,
    interestType: row.interest_type as LeadInterestType,
    status: row.status as LeadStatus,
    createdAt: row.created_at,
    lastContactedAt: row.last_contacted_at,
  };
}

export async function insertLead(input: LeadCaptureInput): Promise<DealershipLead> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: input.userId,
      dealership_id: input.dealershipId ?? null,
      dealership_name: input.dealershipName,
      campaign_id: input.campaignId ?? null,
      event_id: input.eventId ?? null,
      name: input.name ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      source: input.source,
      interest_type: input.interestType ?? "general",
      status: "new",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as LeadRow);
}

export async function listLeads(limit = 100, dealershipId?: string): Promise<DealershipLead[]> {
  const supabase = await createClient();
  const pageSize = clampPageSize(limit);

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (dealershipId) {
    query = query.eq("dealership_id", dealershipId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as LeadRow[]).map(mapRow);
}

export async function countLeadsByCampaign(campaignId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function countLeadsForDealership(dealershipName: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("dealership_name", dealershipName);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function updateLeadStatus({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const payload: Record<string, string> = { status };
  if (status === "contacted" || status === "converted") {
    payload.last_contacted_at = now;
  }

  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as LeadRow);
}

export function buildLeadSummary(leads: DealershipLead[]): LeadSummary {
  const bySource = {
    facebook: 0,
    instagram: 0,
    sms: 0,
    email: 0,
    event: 0,
    manual: 0,
  };

  for (const lead of leads) {
    bySource[lead.source] += 1;
  }

  return {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    converted: leads.filter((lead) => lead.status === "converted").length,
    bySource,
  };
}

export function buildLeadCountsByCampaign(leads: DealershipLead[]) {
  const counts = new Map<string, number>();

  for (const lead of leads) {
    if (!lead.campaignId) continue;
    counts.set(lead.campaignId, (counts.get(lead.campaignId) ?? 0) + 1);
  }

  return counts;
}

export async function listLeadsBySource(source: LeadSource, limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("source", source)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as LeadRow[]).map(mapRow);
}
