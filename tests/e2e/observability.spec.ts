import { expect, test } from "@playwright/test";
import { observeRoute } from "../../src/lib/observability";

test("route timing retains response status, payload and cache boundary", async () => {
  const response = await observeRoute("checkout.verify", async () => Response.json({ error: "Not signed in" }, { status: 401, headers: { "Cache-Control": "no-store" } }));
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ error: "Not signed in" });
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("server-timing")).toMatch(/^app;dur=\d+(\.\d+)?$/);
});
test("API response timing is present without exposing request secrets", async ({ request }) => {
  const response = await request.post("/api/checkout/order", { headers: { origin: "https://not-this-store.invalid" }, data: { private: "not-for-response-headers" } });
  expect(response.status()).toBe(403);
  expect(response.headers()["server-timing"]).toMatch(/^app;dur=/);
  expect(JSON.stringify(response.headers())).not.toContain("not-for-response-headers");
});
