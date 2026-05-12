import { test, expect } from "@playwright/test";

const BASE = process.env.SMOKE_BASE_URL ?? "https://tsurispot.com";

test.describe("Login smoke", () => {
  test("初回シークレット相当でも 1 回押下で Cognito Hosted UI に到達", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs: string[] = [];

    page.on("response", (res) => {
      if (
        res.url().includes("error=Configuration") ||
        res.url().includes("error=redirect_mismatch")
      ) {
        errs.push(res.url());
      }
    });

    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500); // CSRF state 取得待ち

    await page.locator('button:has-text("Googleでログイン")').first().click();
    await page.waitForTimeout(5000);

    const url = page.url();
    expect(
      url.includes("amazoncognito.com") || url.includes("accounts.google.com"),
      `期待: Cognito or Google に到達、実際: ${url}`,
    ).toBe(true);
    expect(url.includes("error=Configuration"), `Configuration error: ${url}`).toBe(false);
    expect(errs.length, `error redirects: ${errs.join(", ")}`).toBe(0);

    await ctx.close();
  });

  test("/api/auth/csrf と /api/auth/session が 200", async ({ request }) => {
    const csrf = await request.get(`${BASE}/api/auth/csrf`);
    expect(csrf.status()).toBe(200);
    const csrfBody = await csrf.json();
    expect(typeof csrfBody.csrfToken).toBe("string");
    expect(csrfBody.csrfToken.length).toBeGreaterThan(0);

    const session = await request.get(`${BASE}/api/auth/session`);
    expect(session.status()).toBe(200);
  });
});
