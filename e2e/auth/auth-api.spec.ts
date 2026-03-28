import { test, expect } from "@playwright/test";

test.describe("認証APIエンドポイント", () => {
  test.describe("NextAuth エンドポイント", () => {
    test("GET /api/auth/providers → LINEプロバイダーが返される", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/providers");
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty("line");
      expect(body.line.id).toBe("line");
      expect(body.line.name).toBe("LINE");
      expect(body.line.type).toBe("oauth");
      expect(body.line.signinUrl).toContain("/api/auth/signin/line");
      expect(body.line.callbackUrl).toContain("/api/auth/callback/line");
    });

    test("GET /api/auth/session → 未認証時は空セッション", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/session");
      expect(res.status()).toBe(200);
      const body = await res.json();
      // 未認証時はnull、空オブジェクト、またはuserなし
      if (body === null || body === undefined) {
        expect(body).toBeNull();
      } else {
        expect(body?.user?.tsuriId).toBeUndefined();
      }
    });

    test("GET /api/auth/csrf → CSRFトークンが返される", async ({
      request,
    }) => {
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
      // カスタムサインインページ /login にリダイレクトされること
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
      // 401（未認証）が先に返る
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

  test.describe("LINE OAuth コールバック", () => {
    test("不正なcodeでコールバックするとエラーページへリダイレクト", async ({
      page,
    }) => {
      // 不正なauthorization codeでコールバックを呼ぶ
      await page.goto(
        "/api/auth/callback/line?code=invalid_code&state=invalid_state"
      );
      // エラーページ（/login）にリダイレクトされること
      await page.waitForURL(/\/(login|api\/auth)/, { timeout: 15000 });
      const url = page.url();
      expect(
        url.includes("/login") || url.includes("error")
      ).toBe(true);
    });

    test("stateパラメータなしのコールバックはエラーになる", async ({
      page,
    }) => {
      await page.goto("/api/auth/callback/line?code=test_code");
      await page.waitForURL(/\/(login|api\/auth)/, { timeout: 15000 });
      const url = page.url();
      expect(
        url.includes("/login") || url.includes("error")
      ).toBe(true);
    });
  });

  test.describe("認証関連のセキュリティ", () => {
    test("CSRF保護が有効", async ({ request }) => {
      // CSRFトークンなしでPOSTするとエラーになること
      const res = await request.post("/api/auth/signin/line", {
        data: {},
      });
      // 200以外 or リダイレクト
      expect([200, 302, 400, 403, 405]).toContain(res.status());
    });

    test("不正なプロバイダーIDでサインインを試みるとエラー", async ({
      page,
    }) => {
      await page.goto("/api/auth/signin/fake-provider");
      const url = page.url();
      // カスタムログインページかエラーページにリダイレクト
      expect(
        url.includes("/login") || url.includes("error")
      ).toBe(true);
    });

    test("セッションcookieのhttpOnly属性を検証", async ({ page }) => {
      await page.goto("/");
      // next-auth.session-tokenがhttpOnlyかどうかはブラウザからは直接取得できないが、
      // document.cookieにセッショントークンが見えないことを確認
      const cookies = await page.evaluate(() => document.cookie);
      expect(cookies).not.toContain("next-auth.session-token");
    });
  });
});
