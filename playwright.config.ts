import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
// Sandboxes and CI images often ship a preinstalled Chromium; use it when PW_CHROMIUM_PATH is set.
const executablePath = process.env.PW_CHROMIUM_PATH;
const launchOptions = executablePath ? { executablePath, args: ["--no-sandbox"] } : {};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Clock/paint-sensitive browser checks need full resources on this workstation and CI.
  // Explicit --workers can still be used for a separate concurrency stress run.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    // Only reuse an intentionally started, isolated fixture server, never a developer server.
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
    env: { FIREBASE_PROJECT_ID: " ", RAZORPAY_KEY_ID: " ", FIRESTORE_EMULATOR_HOST: "127.0.0.1:9" },
    timeout: 180_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 }, launchOptions } },
  ],
});
