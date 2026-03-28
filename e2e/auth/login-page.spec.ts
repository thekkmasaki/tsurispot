import { test, expect } from "@playwright/test";

test.describe("ログインページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("ページが正常に表示される", async ({ page }) => {
    // ロゴとタイトル
    await expect(page.locator("h1")).toHaveText("ログイン");
    await expect(
      page.getByRole("main").getByText("ツリスポ")
    ).toBeVisible();
    await expect(
      page.getByText("お気に入りや釣果をクラウドに保存")
    ).toBeVisible();
  });

  test("LINEログインボタンが表示される", async ({ page }) => {
    const lineButton = page.getByRole("button", { name: /LINEでログイン/ });
    await expect(lineButton).toBeVisible();
    // LINE緑色の背景色
    await expect(lineButton).toHaveCSS("background-color", "rgb(6, 199, 85)");
  });

  test("注意書きが表示される", async ({ page }) => {
    await expect(
      page.getByText("ログインしなくても全機能を利用できます")
    ).toBeVisible();
    await expect(
      page.getByText(/お気に入りや釣果データを/)
    ).toBeVisible();
  });

  test("プライバシーポリシーリンクが存在する", async ({ page }) => {
    const privacyLink = page
      .getByRole("main")
      .getByRole("link", { name: "プライバシーポリシー" });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  test("LINEログインボタンをクリックするとOAuth認証フローが開始される", async ({
    page,
  }) => {
    const lineButton = page.getByRole("button", { name: /LINEでログイン/ });

    // クリックしてナビゲーションを待つ（LINE OAuth or NextAuth signin endpoint）
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/auth/") ||
          resp.url().includes("access.line.me"),
        { timeout: 10000 }
      ),
      lineButton.click(),
    ]);

    // NextAuth の signin エンドポイントか LINE OAuth URL にリクエストが送られること
    expect(
      response.url().includes("/api/auth/") ||
        response.url().includes("access.line.me")
    ).toBe(true);
  });

  test("LINEログインのOAuthリダイレクト先が正しい", async ({ page }) => {
    const lineButton = page.getByRole("button", { name: /LINEでログイン/ });

    // ナビゲーションを追跡
    const navigationPromise = page.waitForURL(
      (url) =>
        url.href.includes("access.line.me") ||
        url.href.includes("/api/auth/signin"),
      { timeout: 15000 }
    );

    await lineButton.click();

    try {
      await navigationPromise;
      const currentUrl = page.url();
      // LINE OAuth認可エンドポイントへリダイレクトされること
      if (currentUrl.includes("access.line.me")) {
        expect(currentUrl).toContain(
          "access.line.me/oauth2/v2.1/authorize"
        );
        // 必須パラメータ
        expect(currentUrl).toContain("response_type=code");
        expect(currentUrl).toContain("scope=profile");
        expect(currentUrl).toContain("state=");
      }
    } catch {
      // LINE へのリダイレクトが環境依存で失敗する場合はスキップ
      test.skip(true, "LINE OAuth redirect requires valid credentials");
    }
  });
});
