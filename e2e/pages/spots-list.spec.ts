import { test, expect } from '@playwright/test';

test.describe('スポット一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spots');
  });

  test('一覧ページが表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/釣り|スポット/);
    const cards = page.locator('a[href^="/spots/"]');
    await expect(cards.first()).toBeVisible();
  });

  test('スポットカードに必要な情報がある', async ({ page }) => {
    const firstCard = page.locator('a[href^="/spots/"]').first();
    await expect(firstCard).toBeVisible();
    // カード内にスポット名テキストがある
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(2);
  });

  test('フィルターUIが存在する', async ({ page }) => {
    // 何かしらのフィルターやソートのUIが表示されている
    const filterArea = page.locator('select, [role="combobox"], button:has-text("フィルタ"), button:has-text("絞"), input[placeholder*="検索"]').first();
    await expect(filterArea).toBeVisible({ timeout: 10000 });
  });
});
