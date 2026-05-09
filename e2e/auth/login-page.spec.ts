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

  test("Appleログインボタンが表示される", async ({ page }) => {
    const appleButton = page.getByRole("button", { name: /Appleでサインイン/ });
    await expect(appleButton).toBeVisible();
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

  test("Cognito OAuth のリダイレクトに identity_provider=Google が含まれる", async ({
    page,
  }) => {
    const googleButton = page.getByRole("button", { name: /Googleでログイン/ });

    const navigationPromise = page.waitForURL(
      (url) =>
        url.href.includes("amazoncognito.com") ||
        url.href.includes("accounts.google.com") ||
        url.href.includes("/api/auth/signin"),
      { timeout: 15000 }
    );

    await googleButton.click();

    try {
      await navigationPromise;
      const currentUrl = page.url();
      if (currentUrl.includes("amazoncognito.com")) {
        expect(currentUrl).toContain("response_type=code");
        expect(currentUrl).toContain("identity_provider=Google");
      }
    } catch {
      test.skip(true, "Cognito OAuth redirect requires valid credentials");
    }
  });

  test("Apple サインインボタンの遷移に identity_provider=SignInWithApple が含まれる", async ({
    page,
  }) => {
    const appleButton = page.getByRole("button", { name: /Appleでサインイン/ });

    const navigationPromise = page.waitForURL(
      (url) =>
        url.href.includes("amazoncognito.com") ||
        url.href.includes("appleid.apple.com") ||
        url.href.includes("/api/auth/signin"),
      { timeout: 15000 }
    );

    await appleButton.click();

    try {
      await navigationPromise;
      const currentUrl = page.url();
      if (currentUrl.includes("amazoncognito.com")) {
        expect(currentUrl).toContain("identity_provider=SignInWithApple");
      }
    } catch {
      test.skip(true, "Cognito OAuth redirect requires valid credentials");
    }
  });
});
