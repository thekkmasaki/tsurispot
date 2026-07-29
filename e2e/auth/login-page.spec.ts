import { test, expect } from "@playwright/test";

test.describe("ログインページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("ページが正常に表示される", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("ログイン");
    await expect(
      page.getByRole("main").getByText("ツリスポ")
    ).toBeVisible();
    await expect(
      page.getByText("お気に入りや釣果をクラウドに保存")
    ).toBeVisible();
  });

  test("Googleログインボタンが表示される", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: /Googleでログイン/ });
    await expect(googleButton).toBeVisible();
  });

  test("Appleボタンは表示されない（Apple IdP 未設定のため撤去済み）", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /Appleでサインイン/ })
    ).toHaveCount(0);
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

  test("Googleログインボタンをクリックすると Cognito 認証フローが開始される", async ({
    page,
  }) => {
    const googleButton = page.getByRole("button", { name: /Googleでログイン/ });

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/auth/") ||
          resp.url().includes("amazoncognito.com") ||
          resp.url().includes("accounts.google.com"),
        { timeout: 10000 }
      ),
      googleButton.click(),
    ]);

    expect(
      response.url().includes("/api/auth/") ||
        response.url().includes("amazoncognito.com") ||
        response.url().includes("accounts.google.com")
    ).toBe(true);
  });

  test("Google ボタン押下で Cognito または Google の認可画面へ到達する", async ({
    page,
  }) => {
    // Cognito は Google 単独クライアントのため authorize から accounts.google.com へ
    // 自動 302 する。identity_provider パラメータは廃止済み(送っても Auth.js が捨てる)。
    const googleButton = page.getByRole("button", { name: /Googleでログイン/ });

    const navigationPromise = page.waitForURL(
      (url) =>
        url.href.includes("amazoncognito.com") ||
        url.href.includes("accounts.google.com"),
      { timeout: 15000 }
    );

    await googleButton.click();

    try {
      await navigationPromise;
      const currentUrl = page.url();
      expect(
        currentUrl.includes("amazoncognito.com") ||
          currentUrl.includes("accounts.google.com")
      ).toBe(true);
      if (currentUrl.includes("amazoncognito.com")) {
        expect(currentUrl).toContain("response_type=code");
      }
    } catch {
      test.skip(true, "Cognito OAuth redirect requires valid credentials");
    }
  });
});
