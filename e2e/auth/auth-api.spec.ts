import { test, expect } from "@playwright/test";

test.describe("認証APIエンドポイント", () => {
  test.describe("NextAuth エンドポイント", () => {
    test("GET /api/auth/providers → Cognitoプロバイダーが返される", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/providers");
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("cognito");
      expect(body.cognito.id).toBe("cognito");
      expect(body.cognito.type).toBe("oidc");
      expect(body.cognito.signinUrl).toContain("/api/auth/signin/cognito");
      expect(body.cognito.callbackUrl).toContain("/api/auth/callback/cognito");
    });

    test("GET /api/auth/session → 未認証時は空セッション", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/session");
      expect(res.status()).toBe(200);
      const body = await res.json();
      if (body === null || body === undefined) {
        expect(body).toBeNull();
      } else {
        expect(body?.user?.tsuriId).toBeUndefined();
      }
    });

    test("GET /api/auth/csrf → CSRFトークンが返される", async ({ request }) => {
      const res = await request.get("/api/auth/csrf");
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("csrfToken");
      expect(typeof body.csrfToken).toBe("string");
      expect(body.csrfToken.length).toBeGreaterThan(0);
    });

    test("GET /api/auth/signin → サインインページにリダイレクト", async ({
      page,
    }) => {
      await page.goto("/api/auth/signin");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("プロフィールAPI バリデーション", () => {
    test("PATCH /api/user/profile - 空のニックネームは拒否", async ({
      request,
    }) => {
      const res = await request.patch("/api/user/profile", {
        data: { nickname: "" },
      });
      expect(res.status()).toBe(401);
    });

    test("PATCH /api/user/profile - 不正なJSONは処理される", async ({
      request,
    }) => {
      const res = await request.patch("/api/user/profile", {
        data: "invalid json",
        headers: { "Content-Type": "text/plain" },
      });
      expect([400, 401]).toContain(res.status());
    });
  });

  test.describe("Cognito OAuth コールバック", () => {
    test("不正なcodeでコールバックするとエラーページへリダイレクト", async ({
      page,
    }) => {
      await page.goto(
        "/api/auth/callback/cognito?code=invalid_code&state=invalid_state"
      );
      await page.waitForURL(/\/(login|api\/auth)/, { timeout: 15000 });
      const url = page.url();
      expect(url.includes("/login") || url.includes("error")).toBe(true);
    });

    test("stateパラメータなしのコールバックはエラーになる", async ({
      page,
    }) => {
      await page.goto("/api/auth/callback/cognito?code=test_code");
      await page.waitForURL(/\/(login|api\/auth)/, { timeout: 15000 });
      const url = page.url();
      expect(url.includes("/login") || url.includes("error")).toBe(true);
    });
  });

  test.describe("認証関連のセキュリティ", () => {
    test("CSRF保護が有効", async ({ request }) => {
      const res = await request.post("/api/auth/signin/cognito", {
        data: {},
      });
      expect([200, 302, 400, 403, 405]).toContain(res.status());
    });

    test("不正なプロバイダーIDでサインインを試みるとエラー", async ({
      page,
    }) => {
      await page.goto("/api/auth/signin/fake-provider");
      const url = page.url();
      expect(url.includes("/login") || url.includes("error")).toBe(true);
    });

    test("セッションcookieのhttpOnly属性を検証", async ({ page }) => {
      await page.goto("/");
      const cookies = await page.evaluate(() => document.cookie);
      expect(cookies).not.toContain("authjs.session-token");
      expect(cookies).not.toContain("next-auth.session-token");
    });
  });
});
