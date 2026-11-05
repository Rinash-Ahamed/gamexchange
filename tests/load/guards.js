// k6 scripts are prepared only. Never approve a production target with these flags.
export const profiles = [10, 50, 100, 500, 1000];
export function stagingTarget() {
  const target = (__ENV.BASE_URL || "").replace(/\/$/, "");
  const approved = (__ENV.STAGING_ORIGIN || "").replace(/\/$/, "");
  if (__ENV.ISOLATED_STAGING !== "true" || !target || target !== approved) throw new Error("Set ISOLATED_STAGING=true and identical BASE_URL/STAGING_ORIGIN for an isolated test deployment.");
  const match = /^https?:\/\/([^/?#:@]+)(?::\d+)?$/.exec(target);
  if (!match) throw new Error("Use an origin without credentials, path, query or fragment.");
  const host = match[1].toLowerCase();
  if (host === "gamexchange.co.in" || host.endsWith(".gamexchange.co.in") || host === "gamexchange-tau.vercel.app") throw new Error("Known production host is forbidden.");
  if (!target.startsWith("https://") && !["localhost", "127.0.0.1"].includes(host)) throw new Error("Remote staging must use HTTPS.");
  return target;
}
export function virtualUsers() {
  const value = Number(__ENV.VUS || "10");
  if (!profiles.includes(value)) throw new Error("VUS must be 10, 50, 100, 500 or 1000.");
  return value;
}
export function testProductIds() {
  const ids = (__ENV.PRODUCT_IDS || "").split(",").filter(Boolean);
  if (!ids.length || ids.some((id) => !/^[a-zA-Z0-9-]{1,128}$/.test(id))) throw new Error("Supply comma-separated public staging PRODUCT_IDS.");
  return ids;
}
