import { defineConfig } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 2,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command: "npm run start",
    url: baseURL + "/health",
    reuseExistingServer: !process.env.CI,
    // Keep the server and test address aligned even when .env has Docker's PORT.
    env: { PORT: new URL(baseURL).port || "3000" },
  },
});
