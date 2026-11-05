export function turnstileResultMatches(result: unknown, action: "contact" | "repair", hostnames: string[]) {
  if (typeof result !== "object" || result === null) return false;
  const value = result as Record<string, unknown>;
  return value.success === true && value.action === action && typeof value.hostname === "string" && hostnames.includes(value.hostname.toLowerCase());
}
