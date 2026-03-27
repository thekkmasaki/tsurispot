import { test, expect } from '@playwright/test';

test.describe('検索オーバーレイ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Ctrl+K で検索オーバーレイが開く', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const input = page.locator('input[placeholder*="スポット"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test('ESC で閉じる', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const overlay = page.locator('div.fixed.inset-x-0.top-0');
    await expect(overlay).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden({ timeout: 5000 });
  });

  test('検索入力で結果が表示される', async ({ page }) => {
    test.setTimeout(60000);
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
  });
});
