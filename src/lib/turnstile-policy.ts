/** Domain restrictions are managed on the Cloudflare widget, not in a second app list. */
export function turnstileResultMatches(result: unknown, action: "contact" | "repair") {
  if (typeof result !== "object" || result === null) return false;
  const value = result as Record<string, unknown>;
  return value.success === true && value.action === action;
}
