"use server";

import { revalidatePath } from "next/cache";

import {
  simulateEmailEngagementLead,
  simulateEventRsvpLead,
  simulateSmsResponseLead,
} from "@/lib/leads/capture-engine";
import {
  buildLeadSummary,
  listLeads,
  updateLeadStatus,
} from "@/lib/leads/repository";
import { requireSession } from "@/lib/auth/session";
import type { LeadStatus } from "@/types/leads";

function revalidateLeadRoutes() {
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/events");
}

export async function getLeadsDashboardAction() {
  try {
    const session = await requireSession();
    const leads = await listLeads(100, session.tenant.dealershipId);
    return { leads, summary: buildLeadSummary(leads) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to load leads.",
    };
  }
}

export async function updateLeadStatusAction(leadId: string, status: LeadStatus) {
  try {
    await requireSession();
    const lead = await updateLeadStatus({ leadId, status });
    revalidateLeadRoutes();
    return { lead };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update lead.",
    };
  }
}

export async function simulateSmsLeadAction(keyword: string, campaignId?: string) {
  try {
    const session = await requireSession();
    const lead = await simulateSmsResponseLead({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      dealershipId: session.tenant.dealershipId,
      keyword,
      campaignId,
    });
    revalidateLeadRoutes();
    return { lead };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to simulate SMS lead.",
    };
  }
}

export async function simulateEventLeadAction(eventId: string, campaignId?: string) {
  try {
    const session = await requireSession();
    const lead = await simulateEventRsvpLead({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      dealershipId: session.tenant.dealershipId,
      eventId,
      campaignId,
    });
    revalidateLeadRoutes();
    return { lead };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to simulate event lead.",
    };
  }
}

export async function simulateEmailLeadAction(campaignId?: string) {
  try {
    const session = await requireSession();
    const lead = await simulateEmailEngagementLead({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      dealershipId: session.tenant.dealershipId,
      campaignId,
    });
    revalidateLeadRoutes();
    return { lead };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to simulate email lead.",
    };
  }
}
