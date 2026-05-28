export function normalizeError(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

export function toActionError(error: unknown, fallback?: string) {
  return { error: normalizeError(error, fallback) };
}
