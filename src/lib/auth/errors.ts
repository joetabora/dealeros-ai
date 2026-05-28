const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  email_not_confirmed:
    "Confirm your email address before signing in. Check your inbox for the verification link.",
  too_many_requests: "Too many attempts. Wait a moment and try again.",
  user_banned: "This account has been disabled. Contact your administrator.",
};

export function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  if (normalized.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }

  if (normalized.includes("too many requests")) {
    return AUTH_ERROR_MESSAGES.too_many_requests;
  }

  if (normalized.includes("user banned")) {
    return AUTH_ERROR_MESSAGES.user_banned;
  }

  return "Unable to sign in right now. Please try again.";
}

export function getSafeRedirectPath(path: string | null | undefined) {
  if (typeof path === "string" && path.startsWith("/dashboard")) {
    return path;
  }

  return "/dashboard";
}
