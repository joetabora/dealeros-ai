export type AppEnvironment = "development" | "staging" | "production";

export function getAppEnvironment(): AppEnvironment {
  const env = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

export function isProduction() {
  return getAppEnvironment() === "production";
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
