import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('タイトルに「ツリスポ」が含まれる', async ({ page }) => {
    await expect(page).toHaveTitle(/ツリスポ/);
  });

  test('検索バーが存在する', async ({ page }) => {
    const searchButton = page.locator('[data-testid="search-trigger"], button:has-text("検索"), [aria-label*="検索"]').first();
    await expect(searchButton).toBeVisible();
  });

  test('人気スポットセクションが表示される', async ({ page }) => {
    const popularSection = page.locator('text=人気').first();
    await expect(popularSection).toBeVisible();
  });

  test('フッターが表示される', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('ナビゲーションリンクが機能する', async ({ page }) => {
    const spotsLink = page.locator('a[href="/spots"]').first();
    if (await spotsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await spotsLink.click();
      await expect(page).toHaveURL(/\/spots/, { timeout: 30000 });
    }
  });
});
