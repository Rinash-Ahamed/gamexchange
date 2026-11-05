import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { setTimeout as delay } from "node:timers/promises";

// Small sequential loopback diagnostic, not a capacity/load test or real-provider measurement.
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
const root = fileURLToPath(new URL("../", import.meta.url));
const server = spawn(process.execPath, [fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: root, env: { ...process.env, NODE_ENV: "production", FIREBASE_PROJECT_ID: " ", RAZORPAY_KEY_ID: " ", FIRESTORE_EMULATOR_HOST: "127.0.0.1:9", PERFORMANCE_LOGGING: "false" }, stdio: "ignore", windowsHide: true,
});
let launchError;
server.on("error", (error) => { launchError = error; });
const base = `http://127.0.0.1:${port}`;
const request = (path) => fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000), redirect: "manual" });
const rounded = (value) => Math.round(value * 10) / 10;
const percentiles = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return Object.fromEntries([50, 95, 99].map((percentile) => [`p${percentile}`, rounded(sorted[Math.ceil(sorted.length * percentile / 100) - 1]) ]));
};
async function sample(path) {
  const started = performance.now();
  const response = await request(path);
  const headersMs = performance.now() - started;
  const body = await response.arrayBuffer();
  return { status: response.status, headersMs: rounded(headersMs), totalMs: rounded(performance.now() - started), bytes: body.byteLength };
}
try {
  let ready = false;
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (launchError || server.exitCode !== null) throw new Error("Isolated diagnostic server failed to start.");
    try { if ((await request("/api/health")).ok) { ready = true; break; } } catch { /* Waiting for owned server only. */ }
    await delay(250);
  }
  if (!ready) throw new Error("Diagnostic startup timed out.");
  const routes = [];
  for (const path of ["/", "/products", "/products?q=PlayStation&section=consoles", "/products/ps2-slimline", "/api/health"]) {
    const first = await sample(path);
    for (let warmup = 0; warmup < 3; warmup++) await sample(path);
    const samples = [];
    for (let index = 0; index < 20; index++) samples.push(await sample(path));
    routes.push({ path, firstRequest: first, warmSamples: samples.length, warmHeadersMs: percentiles(samples.map((item) => item.headersMs)), warmTotalMs: percentiles(samples.map((item) => item.totalMs)), errorCount: samples.filter((item) => item.status !== 200).length, meanResponseBytes: Math.round(samples.reduce((sum, item) => sum + item.bytes, 0) / samples.length) });
  }
  const files = (await readdir(new URL("../.next/static/chunks/", import.meta.url), { withFileTypes: true, recursive: true })).filter((entry) => entry.isFile() && /\.(js|css)$/.test(entry.name));
  const assets = await Promise.all(files.map(async (entry) => {
    const bytes = await readFile(`${entry.parentPath}/${entry.name}`);
    return { name: entry.name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  }));
  console.log(JSON.stringify({ measuredAt: new Date().toISOString(), scope: "Local loopback, sequential fixture HTML/API requests, no Firebase/Auth/Storage/Razorpay/SMTP, not a browser/LCP/FPS or concurrent-capacity test", routes, chunks: { count: assets.length, rawBytes: assets.reduce((sum, item) => sum + item.bytes, 0), gzipBytes: assets.reduce((sum, item) => sum + item.gzipBytes, 0), largest: assets.sort((a, b) => b.bytes - a.bytes).slice(0, 6) } }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Diagnostic failed");
  process.exitCode = 1;
} finally {
  if (server.exitCode === null && !launchError) {
    const stopped = once(server, "exit");
    server.kill();
    await Promise.race([stopped, delay(5000)]);
    if (server.exitCode === null) server.kill("SIGKILL");
  }
}
