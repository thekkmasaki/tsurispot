import { test, expect } from '@playwright/test';

test.describe('釣果報告フロー（自動承認）', () => {
  // スポット詳細ページはSSRが重いのでタイムアウト延長
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/spots/otaru-port', { timeout: 60000 });
    // DOMContentLoaded待ちのみ（networkidleだとdev環境でHMR接続が邪魔）
    await page.waitForLoadState('domcontentloaded');
  });

  test('釣果報告フォームが開閉できる', async ({ page }) => {
    // 「釣果を報告する」ボタンまでスクロール
    const reportButton = page.locator('button:has-text("釣果を報告する")');
    await reportButton.scrollIntoViewIfNeeded();
    await expect(reportButton).toBeVisible({ timeout: 30000 });

    // フォームを開く
    await reportButton.click();

    // フォームフィールドが表示される
    const usernameInput = page.locator('#cr-username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#cr-fishname')).toBeVisible();
    await expect(page.locator('#cr-date')).toBeVisible();

    // キャンセルで閉じる
    const cancelButton = page.locator('button:has-text("キャンセル")');
    await cancelButton.click();

    // フォームが閉じてボタンが再表示される
    await expect(reportButton).toBeVisible({ timeout: 5000 });
  });

  test('バリデーションが動作する（空フォーム送信）', async ({ page }) => {
    const reportButton = page.locator('button:has-text("釣果を報告する")');
    await reportButton.scrollIntoViewIfNeeded();
    await expect(reportButton).toBeVisible({ timeout: 30000 });
    await reportButton.click();

    // フォームが開くのを待つ
    const submitButton = page.locator('button:has-text("釣果を投稿する")');
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await submitButton.click();

    // required属性があるためフォームは送信されない
    await expect(submitButton).toBeVisible();
  });

  test('通報ボタンがホバーで表示される', async ({ page }) => {
    // 釣果リストセクションまでスクロール
    const heading = page.locator('h3:has-text("釣果報告")');
    if (await heading.isVisible({ timeout: 30000 }).catch(() => false)) {
      await heading.scrollIntoViewIfNeeded();
    }

    // groupクラスのカードを探す
    const reportCard = page.locator('.group').first();
    if (await reportCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await reportCard.hover();
      const flagButton = reportCard.locator('button[aria-label="通報"]');
      await expect(flagButton).toBeVisible({ timeout: 5000 });
    }
  });
});
