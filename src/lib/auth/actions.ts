"use server";

import { redirect } from "next/navigation";

import { getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = formData.get("redirect");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  redirect(getSafeRedirectPath(typeof redirectTo === "string" ? redirectTo : null));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
