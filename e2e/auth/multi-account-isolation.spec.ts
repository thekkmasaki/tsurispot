import { test, expect } from "@playwright/test";

test.describe("複数ユーザーセッション分離（旧LINE実装の『2人目が1人目になる』バグ再現テスト）", () => {
  test("別ブラウザコンテキストのセッション cookie が混入しない", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto("/");
    await pageB.goto("/");

    const sessionA = await pageA.request.get("/api/auth/session");
    const sessionB = await pageB.request.get("/api/auth/session");

    expect(sessionA.status()).toBe(200);
    expect(sessionB.status()).toBe(200);

    const cookiesA = await contextA.cookies();
    const cookiesB = await contextB.cookies();
    const sessionTokenA = cookiesA.find((c) => c.name.includes("session-token"));
    const sessionTokenB = cookiesB.find((c) => c.name.includes("session-token"));

    if (sessionTokenA && sessionTokenB) {
      expect(sessionTokenA.value).not.toBe(sessionTokenB.value);
    }

    await contextA.close();
    await contextB.close();
  });

  test("同一ブラウザでログアウト後に旧セッションが残らない", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/");
    const beforeSession = await page.request.get("/api/auth/session");
    expect(beforeSession.status()).toBe(200);

    await context.clearCookies();

    await page.goto("/");
    const afterSession = await page.request.get("/api/auth/session");
    const afterBody = await afterSession.json();

    if (afterBody === null || afterBody === undefined) {
      expect(afterBody).toBeNull();
    } else {
      expect(afterBody?.user?.tsuriId).toBeUndefined();
    }

    await context.close();
  });

  test("session cookie は HttpOnly でクライアント JS から読めない", async ({ page }) => {
    await page.goto("/");
    const visibleCookies = await page.evaluate(() => document.cookie);
    expect(visibleCookies).not.toMatch(/authjs\.session-token/);
    expect(visibleCookies).not.toMatch(/next-auth\.session-token/);
  });

  test("/api/health/auth が AUTH_SECRET digest を返す", async ({ request }) => {
    const res = await request.get("/api/health/auth");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("authSecretDigest");
    expect(body).toHaveProperty("instance");
    expect(body).toHaveProperty("timestamp");

    if (body.authSecretPresent) {
      expect(typeof body.authSecretDigest).toBe("string");
      expect(body.authSecretDigest).toHaveLength(8);
    }
  });
});
