import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  // Role switching and moderation are deliberately development-only.
  testMatch:
    process.env.ANTRO_INTERNAL_TOOLS === "1"
      ? "**/*.spec.ts"
      : ["**/ui-ux.spec.ts", "**/hosting.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
    launchOptions: {
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    },
    trace: "retain-on-failure",
  },
  reporter: "list",
});
