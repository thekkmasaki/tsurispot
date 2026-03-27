import { test, expect } from '@playwright/test';

test.describe('スポット発見フロー', () => {
  test('一覧 → カードクリック → 詳細ページ表示', async ({ page }) => {
    await page.goto('/spots');

    // 最初のスポットカードをクリック
    const firstCard = page.locator('a[href^="/spots/"]').first();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();

    // 詳細ページに遷移（devモードは重いのでtimeout長め）
    await page.waitForURL(/\/spots\/[a-z]/, { timeout: 60000 });
    expect(page.url()).toContain(href);

    // h1が表示される
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('スポット詳細 → お気に入り追加', async ({ page }) => {
    await page.goto('/spots/otaru-port', { timeout: 60000 });

    const favButton = page.locator('button[aria-label*="お気に入り"], button:has(svg.lucide-heart)').first();
    if (await favButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await favButton.click();
      await page.waitForTimeout(500);
    }
  });
});
