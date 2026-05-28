export const DEMO_MODE_COOKIE = "dealeros_demo_mode";

export function isDemoModeEnabled(cookieValue: string | undefined) {
  return cookieValue === "active";
}
