import { test } from "@playwright/test";

test.describe("称号システム スクリーンショット", () => {
  test("称号一覧ページ", async ({ page }) => {
    await page.goto("/titles");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/title-list.png", fullPage: true });
  });

  test("ヘッダー（未ログイン）", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "test-results/header-no-auth.png", clip: { x: 0, y: 0, width: 1280, height: 60 } });
  });

  test("マイページ（未ログイン）", async ({ page }) => {
    await page.goto("/mypage");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test-results/mypage-no-auth.png" });
  });

  test("スポット詳細の釣果セクション", async ({ page }) => {
    await page.goto("/spots/otaru-port");
    await page.waitForTimeout(2000);
    // 釣果報告セクションまでスクロール
    const section = page.getByText("みんなの釣果報告");
    if (await section.isVisible()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: "test-results/spot-catch-reports.png", fullPage: true });
  });
});
