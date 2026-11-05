import "server-only";
import { turnstileResultMatches } from "./turnstile-policy";

export async function verifyTurnstile(token: unknown, action: "contact" | "repair"): Promise<"ok" | "invalid" | "unavailable"> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  // Rollout is opt-in until keys are configured. Partial configuration fails closed.
  if (!siteKey && !secret && !hosts.length) return "ok";
  if (!siteKey || !secret || !hosts.length) return "unavailable";
  if (typeof token !== "string" || !token || token.length > 2048) return "invalid";
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(6000),
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, response: token }),
    });
    if (!response.ok) return "unavailable";
    return turnstileResultMatches(await response.json(), action, hosts) ? "ok" : "invalid";
  } catch { return "unavailable"; }
}
