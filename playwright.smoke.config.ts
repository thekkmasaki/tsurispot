import { defineConfig, devices } from "@playwright/test";

// 本番 (tsurispot.com) に対する smoke test 用設定。
// dev server は起動せず、本番 or SMOKE_BASE_URL に対して実行する。
export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,
  reporter: [["line"]],
  timeout: 60000,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
