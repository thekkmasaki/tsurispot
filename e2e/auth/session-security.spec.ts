import { test, expect } from "@playwright/test";

test.describe("セッション・セキュリティ", () => {
  test.describe("セッション管理", () => {
    test("未認証ユーザーのセッションAPIレスポンスが正しい形式", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/session");
      expect(res.status()).toBe(200);
      const body = await res.json();
      // 未認証時はnullまたは空オブジェクト（Auth.jsのバージョンにより異なる）
      if (body === null) {
        expect(body).toBeNull();
      } else {
        expect(body?.user?.tsuriId).toBeUndefined();
        expect(body?.user?.nickname).toBeUndefined();
      }
    });

    test("セッションAPIがJSON形式で応答する", async ({ request }) => {
      const res = await request.get("/api/auth/session");
      const contentType = res.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });
  });

  test.describe("ミドルウェア", () => {
    test("API パスはミドルウェアを通過しない（直接アクセス可能）", async ({
      request,
    }) => {
      // API エンドポイントがミドルウェアでブロックされないこと
      const res = await request.get("/api/auth/providers");
      expect(res.status()).toBe(200);
    });

    test("静的アセットはミドルウェアを通過しない", async ({ request }) => {
      const res = await request.get("/favicon.ico");
      expect([200, 304]).toContain(res.status());
    });
  });

  test.describe("クロスサイト攻撃防御", () => {
    test("ログインページでXSSペイロードがエスケープされる", async ({
      page,
    }) => {
      // クエリパラメータにXSSペイロードを仕込む
      await page.goto(
        '/login?error=<script>alert("xss")</script>'
      );
      // スクリプトが実行されないこと
      const alertTriggered = await page.evaluate(() => {
        return (window as unknown as Record<string, unknown>).__xss_triggered === true;
      });
      expect(alertTriggered).toBe(false);

      // ページ内にエスケープされていないscriptタグがないこと
      const html = await page.content();
      expect(html).not.toContain("<script>alert");
    });

    test("コールバックURLにオープンリダイレクトがないこと", async ({
      page,
    }) => {
      // 悪意のあるcallbackUrlを仕込む
      await page.goto(
        "/api/auth/signin?callbackUrl=https://evil.example.com"
      );
      // 外部サイトにリダイレクトされないこと
      const url = page.url();
      expect(url).not.toContain("evil.example.com");
    });
  });

  test.describe("認証フロー完全性", () => {
    test("ログアウトAPIが存在する", async ({ request }) => {
      const res = await request.get("/api/auth/signout");
      // GET は CSRF ページを返す（200）か、POST が必要（405）
      expect([200, 302, 405]).toContain(res.status());
    });

    test("providers APIで返されるLINEの設定が正しい", async ({
      request,
    }) => {
      const res = await request.get("/api/auth/providers");
      const body = await res.json();

      // LINEプロバイダーの存在確認
      expect(body.line).toBeDefined();
      expect(body.line.id).toBe("line");
      expect(body.line.name).toBe("LINE");
      expect(body.line.type).toBe("oauth");

      // signInUrlとcallbackUrlのパスが正しい
      expect(body.line.signinUrl).toMatch(
        /\/api\/auth\/signin\/line$/
      );
      expect(body.line.callbackUrl).toMatch(
        /\/api\/auth\/callback\/line$/
      );
    });
  });

  test.describe("エラーハンドリング", () => {
    test("認証エラーページがログインページにリダイレクトされる", async ({
      page,
    }) => {
      await page.goto("/api/auth/error?error=Configuration");
      // カスタムエラーページ (/login) へリダイレクト
      await page.waitForURL(/\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/login/);
    });

    test("未知の認証エラータイプでもクラッシュしない", async ({ page }) => {
      await page.goto("/api/auth/error?error=UnknownError");
      // クラッシュせずにページが表示されること
      await page.waitForURL(/\/login/, { timeout: 10000 });
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
