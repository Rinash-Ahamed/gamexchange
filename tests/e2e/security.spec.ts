import { test, expect, type APIRequestContext } from "@playwright/test";

const ORIGIN = `http://localhost:${process.env.PW_PORT ?? 4173}`;

let n = 0;
const phone = () => "9" + String(Math.floor(Math.random() * 1e9)).padStart(9, "0");
const ip = () => `203.0.113.${(++n % 250) + 1}`;
const good = { kind: "contact", contactTopic: "General enquiry", name: "Test User", phone: "9876543210", contactMethod: "WhatsApp", message: "Is the PS5 still available?", branch: "No preference" };

async function token(request: APIRequestContext, xff: string, wait = true) {
  const r = await request.get("/api/enquiry/token", { headers: { "x-forwarded-for": xff, origin: ORIGIN } });
  expect(r.status()).toBe(200);
  const t = (await r.json()).token as string;
  if (wait) await new Promise((res) => setTimeout(res, 2200));
  return t;
}
const post = (request: APIRequestContext, xff: string, data: unknown, headers: Record<string, string> = {}) =>
  request.post("/api/enquiry", { data: data as object, headers: { "x-forwarded-for": xff, origin: ORIGIN, ...headers } });

test.describe("enquiry API security", () => {
  test("accepts a valid enquiry once, then rejects token replay", async ({ request }) => {
    const x = ip();
    const t = await token(request, x);
    const ok = await post(request, x, { ...good, phone: phone(), _t: t });
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.whatsappUrl).toContain("wa.me");
    const replay = await post(request, x, { ...good, phone: "9876543211", _t: t });
    expect(replay.status()).toBe(400);
  });

  test("rejects missing/forged tokens and too-fast submissions", async ({ request }) => {
    const x = ip();
    expect((await post(request, x, good)).status()).toBe(400);
    expect((await post(request, x, { ...good, phone: phone(), _t: "forged.token" })).status()).toBe(400);
    const fast = await token(request, x, false);
    expect((await post(request, x, { ...good, phone: phone(), _t: fast })).status()).toBe(429);
  });

  test("blocks cross-origin and wrong content-type", async ({ request }) => {
    const x = ip();
    expect((await post(request, x, good, { origin: "https://evil.example" })).status()).toBe(403);
    const ct = await request.post("/api/enquiry", { data: "a=b", headers: { "content-type": "text/plain", "x-forwarded-for": x, origin: ORIGIN } });
    expect(ct.status()).toBe(415);
  });

  test("rejects oversized bodies", async ({ request }) => {
    const x = ip();
    const r = await post(request, x, { ...good, phone: phone(), message: "a".repeat(20000) });
    expect(r.status()).toBe(413);
  });

  test("validates fields and strips control characters / newlines from names", async ({ request }) => {
    const x = ip();
    const t1 = await token(request, x);
    const bad = await post(request, x, { kind: "contact", name: "x", _t: t1 });
    expect(bad.status()).toBe(400);
    const t2 = await token(request, x);
    const ok = await post(request, x, { ...good, phone: phone(), name: "Eve\r\nBcc: a@b.c", _t: t2 });
    expect(ok.status()).toBe(200);
    const url = decodeURIComponent((await ok.json()).whatsappUrl as string);
    expect(url).not.toMatch(/\r/);
  });

  test("honeypot looks like success but carries no message", async ({ request }) => {
    const x = ip();
    const t = await token(request, x);
    const r = await post(request, x, { ...good, phone: phone(), website: "http://spam.example", _t: t });
    expect(r.status()).toBe(200);
    expect(decodeURIComponent((await r.json()).whatsappUrl)).not.toContain("PS5");
  });

  test("per-phone limit trips after repeated enquiries from different IPs", async ({ request }) => {
    const shared = phone();
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) {
      const x = ip();
      const t = await token(request, x);
      codes.push((await post(request, x, { ...good, phone: shared, _t: t })).status());
    }
    expect(codes.slice(0, 3)).toEqual([200, 200, 200]);
    expect(codes[3]).toBe(429);
  });

  test("security headers are present", async ({ request }) => {
    const r = await request.get("/");
    const h = r.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toBeTruthy();
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
