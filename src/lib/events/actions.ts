"use server";

import { revalidatePath } from "next/cache";

import { createEvent } from "@/lib/events/repository";
import { parseEventInput } from "@/lib/events/validation";
import { requireSession } from "@/lib/auth/session";
import type { EventFormState, EventInput } from "@/types/event";

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("events")) {
      return "Unable to save event. Confirm the Supabase events migration is applied.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  try {
    const session = await requireSession();
    const input = parseEventInput(formData);
    const event = await createEvent({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      input,
    });

    revalidatePath("/dashboard/events");
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
    const event = await createEvent({
      userId: session.user.id,
      dealershipName: session.dealer.name,
      input: inputs,
    });

    revalidatePath("/dashboard/events");
    return { success: true, event };
  } catch (error) {
    return { error: getActionErrorMessage(error) };
  }
}
