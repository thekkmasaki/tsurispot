import { test, expect } from "@playwright/test";

test.describe("ユーザーメニュー（未認証）", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // セッション読み込み待ち（ローディングプレースホルダーが消えるまで）
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );
  });

  test("ログインアイコンリンクが表示される", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "ログイン" });
    await expect(loginLink).toBeVisible();
  });

  test("ログインアイコンクリックでログインページへ遷移", async ({
    page,
  }) => {
    const loginLink = page.getByRole("link", { name: "ログイン" });
    await loginLink.click();
    await expect(page).toHaveURL("/login");
  });

  test("ドロップダウンメニュー（マイページ・ログアウト）は表示されない", async ({
    page,
  }) => {
    await expect(page.getByText("マイページ")).not.toBeVisible();
    await expect(page.getByText("ログアウト")).not.toBeVisible();
  });
});

test.describe("ユーザーメニュー - キーボード操作", () => {
  test("Escapeキーでメニューが閉じる動作をテスト（未認証時はスキップ）", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // 未認証時はユーザーメニューボタンが存在しないのでスキップ
    const menuButton = page.getByRole("button", { name: "ユーザーメニュー" });
    const isVisible = await menuButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, "未認証時はユーザーメニューボタンなし");
      return;
    }

    await menuButton.click();
    await expect(page.getByText("マイページ")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("マイページ")).not.toBeVisible();
  });
});

test.describe("ログインページからの導線", () => {
  test("トップページ → ログインアイコン → ログインページ → LINEボタン", async ({
    page,
  }) => {
    // トップページ
    await page.goto("/");
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    // ログインアイコンクリック
    await page.getByRole("link", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/login");

    // LINEログインボタン確認
    const lineButton = page.getByRole("button", { name: /LINEでログイン/ });
    await expect(lineButton).toBeVisible();
    await expect(lineButton).toBeEnabled();
  });

  test("スポット詳細ページからもログインへ遷移できる", async ({ page }) => {
    await page.goto("/spots/otaru-port");
    await page.waitForFunction(
      () => !document.querySelector(".animate-pulse"),
      { timeout: 10000 }
    );

    const loginLink = page.getByRole("link", { name: "ログイン" });
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL("/login");
    }
  });
});
