import { test, expect } from '@playwright/test';

test.describe('検索フロー', () => {
  test('Ctrl+K → 検索 → 結果クリック → ページ遷移', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/');
    await page.keyboard.press('Control+k');

    const input = page.locator('input[placeholder*="スポット"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });

    // API応答を待ちながら入力
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/search') && resp.status() === 200,
      { timeout: 30000 }
    );
    await input.fill('小樽');
    await responsePromise;

    // 結果が描画されるのを待つ
    const result = page.locator('li button, ul button').first();
    await expect(result).toBeVisible({ timeout: 10000 });
    await result.click();

    // ページ遷移が発生したことを確認
    await page.waitForURL(/\/(spots|fish|blog|guide)\//, { timeout: 60000 });
    expect(page.url()).toMatch(/\/(spots|fish|blog|guide)\//);
  });
});
