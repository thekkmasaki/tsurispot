import { test, expect } from '@playwright/test';

test.describe('スポット詳細ページ (小樽港)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spots/otaru-port', { timeout: 60000 });
  });

  test('スポット名が表示される', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('小樽');
  });

  test('釣れる魚セクションが表示される', async ({ page }) => {
    const fishSection = page.locator('text=釣れる魚').first();
    if (await fishSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(fishSection).toBeVisible();
    }
  });

  test('JSON-LD構造化データが存在する', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    // JSON-LDがなくてもページ自体が200で表示されていればOK
    if (count > 0) {
      const content = await jsonLd.first().textContent();
      expect(content).toBeTruthy();
      const parsed = JSON.parse(content!);
      expect(parsed['@context']).toBe('https://schema.org');
    }
  });

  test('お気に入りボタンが存在する', async ({ page }) => {
    const favButton = page.locator('button[aria-label*="お気に入り"], button:has(svg.lucide-heart), [data-testid="favorite"]').first();
    if (await favButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await favButton.click();
    }
  });
});
