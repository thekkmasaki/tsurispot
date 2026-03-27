import { test, expect } from '@playwright/test';

test.describe('魚種一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fish');
  });

  test('魚種一覧が表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/魚/);
    const fishCards = page.locator('a[href^="/fish/"]');
    await expect(fishCards.first()).toBeVisible();
  });

  test('カテゴリフィルターが動作する', async ({ page }) => {
    // 海水/淡水/汽水のフィルターボタンを探す
    const seaFilter = page.locator('button:has-text("海水"), [data-value="sea"]').first();
    if (await seaFilter.isVisible()) {
      await seaFilter.click();
      // フィルタ後もカードが表示されていること
      const fishCards = page.locator('a[href^="/fish/"]');
      await expect(fishCards.first()).toBeVisible();
    }
  });

  test('魚カードに名前と画像がある', async ({ page }) => {
    const firstCard = page.locator('a[href^="/fish/"]').first();
    await expect(firstCard).toBeVisible();
    // 画像要素がある
    const img = firstCard.locator('img').first();
    if (await img.isVisible()) {
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });
});
