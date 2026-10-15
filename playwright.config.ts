import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
// Sandboxes and CI images often ship a preinstalled Chromium; use it when PW_CHROMIUM_PATH is set.
const executablePath = process.env.PW_CHROMIUM_PATH;
const launchOptions = executablePath ? { executablePath, args: ["--no-sandbox"] } : {};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 }, launchOptions } },
  ],
});
