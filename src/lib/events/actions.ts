"use server";

import { revalidatePath } from "next/cache";

import { getDealershipMemoryProfile } from "@/lib/campaigns/memory/repository";
import { syncEventMemory } from "@/lib/events/memory";
import { generateEventPromotionPack } from "@/lib/events/promotion-engine";
import {
  createEvent,
  saveEventPromotionPackItem,
  updateEventPromotionPack,
} from "@/lib/events/repository";
import { parseEventInput } from "@/lib/events/validation";
import { scheduleFromEvent } from "@/lib/scheduling/schedule-service";
import { requireSession } from "@/lib/auth/session";
import type { EventFormState, EventInput } from "@/types/event";

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("events") ||
      error.message.includes("promotion_pack")
    ) {
      return "Unable to save event. Confirm the Supabase events migrations are applied.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function revalidateEventRoutes(eventId?: string) {
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/autopilot");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/approvals");

  if (eventId) {
    revalidatePath(`/dashboard/events/${eventId}`);
  }
}

async function createEventWithPromotion({
  userId,
  dealershipId,
  dealershipName,
  input,
}: {
  userId: string;
  dealershipId: string;
  dealershipName: string;
  input: EventInput;
}) {
  const memory = await getDealershipMemoryProfile(userId, dealershipName);

  const draftEvent = await createEvent({
    userId,
    dealershipId,
    dealershipName,
    input,
  });

  const promotionPack = generateEventPromotionPack(draftEvent, memory);
  const event = await updateEventPromotionPack(draftEvent.id, promotionPack);

  await syncEventMemory({
    userId,
    dealershipName,
    event,
  });

  await scheduleFromEvent({
    userId,
    dealershipId,
    event,
  });

  return event;
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  try {
    const session = await requireSession();
    const input = parseEventInput(formData);
    const event = await createEventWithPromotion({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.dealer.name,
      input,
    });

    revalidateEventRoutes(event.id);
    return { success: true, event };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function createEventFromInputs(
  inputs: EventInput,
): Promise<EventFormState> {
  try {
    const session = await requireSession();
    const event = await createEventWithPromotion({
      userId: session.user.id,
      dealershipId: session.tenant.dealershipId,
      dealershipName: session.dealer.name,
      input: inputs,
    });

    revalidateEventRoutes(event.id);
    return { success: true, event };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}

export async function updatePromotionItemAction(
  eventId: string,
  itemId: string,
  content: string,
) {
  try {
    await requireSession();

    if (!content.trim()) {
      return { error: "Content cannot be empty." };
    }

    const event = await saveEventPromotionPackItem({
      eventId,
      itemId,
      content: content.trim(),
    });

    revalidateEventRoutes(eventId);
    return { success: true as const, event };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
