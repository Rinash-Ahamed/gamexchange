import http from "k6/http";
import execution from "k6/execution";
import { randomBytes } from "k6/crypto";
import { check } from "k6";
import { SharedArray } from "k6/data";
import { Counter } from "k6/metrics";
import { stagingTarget, virtualUsers } from "./guards.js";

const base = stagingTarget();
const vus = virtualUsers();
if (__ENV.ALLOW_CHECKOUT_WRITES !== "true" || __ENV.STAGING_EMAIL_DISABLED !== "true" || !__ENV.CUSTOMERS_FILE) throw new Error("Explicitly approve staging test-order writes, disable staging SMTP externally and supply CUSTOMERS_FILE.");
const customers = new SharedArray("isolated customers", () => JSON.parse(open(__ENV.CUSTOMERS_FILE)));
if (customers.length < vus) throw new Error("Provide a unique test-user fixture per VU, not a shared consumer account.");
const throttled = new Counter("checkout_throttled");
export const options = {
  scenarios: { checkout: { executor: "per-vu-iterations", vus, iterations: 1, maxDuration: "5m" } },
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<2500", "p(99)<5000"], checks: ["rate>0.99"] },
  summaryTrendStats: ["med", "p(50)", "p(95)", "p(99)", "max"],
};
function uuid() {
  const bytes = new Uint8Array(randomBytes(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export default function () {
  const customer = customers[execution.vu.idInTest - 1];
  if (!customer || typeof customer.idToken !== "string" || !customer.items || !Number.isSafeInteger(customer.expectedAmount) || !customer.shipping) throw new Error("Invalid isolated customer fixture; never print it.");
  const requestId = uuid();
  const body = JSON.stringify({ requestId, items: customer.items, expectedAmount: customer.expectedAmount, shipping: customer.shipping, privacyConsent: { accepted: true, version: "2026-11-03-v1" } });
  const params = { headers: { "Content-Type": "application/json", Origin: base, Authorization: `Bearer ${customer.idToken}` }, tags: { name: "POST /api/checkout/order" }, timeout: "30s", redirects: 0 };
  const first = http.post(`${base}/api/checkout/order`, body, params);
  if (first.status === 429) throttled.add(1);
  if (!check(first, { "authenticated test order created": (value) => value.status === 200 && value.json("mode") === "test" })) return;
  const again = http.post(`${base}/api/checkout/order`, body, params);
  check(again, { "same request reuses gateway order": (value) => value.status === 200 && value.json("orderId") === first.json("orderId") });
  // Optional pre-captured sandbox fixture verifies repeated callbacks, never captures/charges a payment.
  // This fixture belongs to a separately prepared order for this UID, not the just-created quote.
  if (customer.verification && __ENV.ALLOW_VERIFICATION_FIXTURES === "true") {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = http.post(`${base}/api/checkout/verify`, JSON.stringify(customer.verification), { ...params, tags: { name: "POST /api/checkout/verify" } });
      check(result, { "captured test callback is idempotently verified": (value) => value.status === 200 && value.json("ok") === true && value.json("mode") === "test" });
    }
  }
}
