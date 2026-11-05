import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

// Own a loopback-only production server. Never reuse or stop a developer's server.
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
const origin = `http://127.0.0.1:${port}`;
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const server = spawn(process.execPath, [next, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: fileURLToPath(new URL("../", import.meta.url)),
  // These are contract checks, never connectivity checks against a deployment's real data.
  // Whitespace survives dotenv loading, then application guards trim it to unconfigured.
  env: { ...process.env, NODE_ENV: "production", FIREBASE_PROJECT_ID: " ", RAZORPAY_KEY_ID: " ", FIRESTORE_EMULATOR_HOST: "127.0.0.1:9" },
  stdio: "ignore",
  windowsHide: true,
});
let launchError;
server.on("error", (error) => { launchError = error; });
const request = (path, options = {}) => fetch(`${origin}${path}`, {
  // Contract correctness, not a latency SLO; allow dependency cold-load on slow filesystems.
  ...options, redirect: "manual", signal: AbortSignal.timeout(15000),
});
const noStore = (response) => assert.match(response.headers.get("cache-control") ?? "", /no-store/);
let passed = 0;
async function check(name, run) {
  await run();
  passed += 1;
  console.log(`PASS ${name}`);
}

try {
  await check("Firebase Admin loads without CommonJS-to-ESM bridging", async () => {
    const result = spawnSync(process.execPath, ["--no-experimental-require-module", "-e",
      "require('firebase-admin/auth'); require('firebase-admin/firestore'); require('firebase-admin/storage'); import('firebase-admin/auth').catch(error => { console.error(error.message); process.exitCode = 1; });"], {
      cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8", timeout: 30000, windowsHide: true,
    });
    assert.equal(result.status, 0, `Firebase Admin module import failed: ${result.error?.message ?? result.stderr}`);
  });
  const deadline = Date.now() + 60000;
  let ready = false;
  while (Date.now() < deadline) {
    if (launchError || server.exitCode !== null || server.signalCode !== null) throw new Error("Production health-check server could not start.");
    try {
      const response = await request("/api/health");
      if (response.status === 200 && (await response.json()).service === "gamexchange") { ready = true; break; }
    } catch { /* Startup may still be in progress. */ }
    await delay(250);
  }
  assert.ok(ready, "Production health-check server did not become ready within 60 seconds.");
  await check("API liveness and no-store", async () => {
    const response = await request("/api/health");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "gamexchange" });
    noStore(response);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
  await check("Token endpoint rejects missing origin", async () => {
    const response = await request("/api/enquiry/token");
    assert.equal(response.status, 403);
    noStore(response);
  });
  await check("Dependency readiness requires an admin session", async () => {
    const response = await request("/api/admin/readiness");
    assert.equal(response.status, 401);
    noStore(response);
  });
  await check("Same-origin token issuance", async () => {
    const response = await request("/api/enquiry/token", { headers: { Origin: origin } });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.match(body.token, /^\d+\.[\w-]+\.[\w-]+$/);
    noStore(response);
  });
  await check("Enquiry rejects cross-origin requests", async () => {
    const response = await request("/api/enquiry", { method: "POST", headers: { Origin: "https://invalid.example", "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 403);
    noStore(response);
  });
  await check("Enquiry rejects unsigned payloads", async () => {
    const response = await request("/api/enquiry", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, false);
    noStore(response);
  });
  await check("Enquiry enforces body size", async () => {
    const response = await request("/api/enquiry", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ content: "x".repeat(9000) }) });
    assert.equal(response.status, 413);
    noStore(response);
  });
  await check("Enquiry limits chunked UTF-8 bodies without Content-Length", async () => {
    const data = new TextEncoder().encode(JSON.stringify({ content: "\u20b9".repeat(3000) }));
    const response = await request("/api/enquiry", {
      method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, duplex: "half",
      body: new ReadableStream({ start(controller) { controller.enqueue(data); controller.close(); } }),
    });
    assert.equal(response.status, 413);
    noStore(response);
  });
  await check("Admin session rejects cross-origin requests", async () => {
    const response = await request("/api/admin/session", { method: "POST", headers: { Origin: "https://invalid.example", "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 403);
    noStore(response);
  });
  await check("Checkout creation rejects cross-origin requests", async () => {
    const response = await request("/api/checkout/order", { method: "POST", headers: { Origin: "https://invalid.example", "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 403);
    noStore(response);
  });
  await check("Checkout rejects invalid cart data before provider access", async () => {
    const response = await request("/api/checkout/order", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 400);
    noStore(response);
  });
  await check("Checkout verification rejects malformed payment data", async () => {
    const response = await request("/api/checkout/verify", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 400);
    noStore(response);
  });
  await check("Unsigned webhooks cannot update orders", async () => {
    const response = await request("/api/checkout/webhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.ok([400, 503].includes(response.status));
    noStore(response);
  });
  await check("Email worker requires its independent scheduler secret", async () => {
    const response = await request("/api/internal/order-emails");
    assert.equal(response.status, 401);
    noStore(response);
  });
  await check("Unversioned uploaded images reject before database access", async () => {
    for (const path of ["/api/inventory/fixture/image", "/api/banners/fixture/image", "/api/franchise/fixture/image", "/api/homepage-images/zone-ps5"]) {
      const response = await request(path);
      assert.equal(response.status, 404);
      noStore(response);
    }
  });
  console.log(`API health check passed (${passed} checks). Firebase/Auth/Storage connectivity is not covered.`);
} catch (error) {
  console.error(`API health check failed: ${error instanceof Error ? error.message : "Unknown failure"}`);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null && server.signalCode === null && !launchError) {
    const stopped = once(server, "exit");
    server.kill();
    await Promise.race([stopped, delay(5000)]);
    if (server.exitCode === null && server.signalCode === null) server.kill("SIGKILL");
  }
}
