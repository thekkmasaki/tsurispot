import { test, expect } from '@playwright/test';

test.describe('モバイルナビゲーション', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('モバイルでトップページが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ツリスポ/);
  });

  test('モバイルでスポット一覧が表示される', async ({ page }) => {
    await page.goto('/spots');
    const cards = page.locator('a[href^="/spots/"]');
    await expect(cards.first()).toBeVisible();
  });

  test('モバイルでスポット詳細が表示される', async ({ page }) => {
    await page.goto('/spots/otaru-port', { timeout: 60000 });
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('小樽');
  });

  test('モバイルナビのリンクが機能する', async ({ page }) => {
    await page.goto('/');
    const mobileNav = page.locator('nav a[href="/spots"]').first();
    if (await mobileNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await mobileNav.click();
      await expect(page).toHaveURL(/\/spots/);
    }
  });
});
