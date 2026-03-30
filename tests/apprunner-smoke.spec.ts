import { test, expect } from '@playwright/test';

const BASE = 'https://iy22kgsc5h.ap-northeast-1.awsapprunner.com';

test.describe('App Runner 動作確認', () => {

  test('トップページが正常表示', async ({ page }) => {
    const res = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/ツリスポ/);
    // スクリーンショット
    await page.screenshot({ path: 'tests/screenshots/01-top.png', fullPage: false });
  });

  test('スポット一覧ページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/spots`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('釣りスポット');
    await page.screenshot({ path: 'tests/screenshots/02-spots.png', fullPage: false });
  });

  test('スポット詳細ページ（明石港）', async ({ page }) => {
    const res = await page.goto(`${BASE}/spots/akashi-port`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    // 地図・天気・アフィリエイト等の主要セクションが存在
    const content = await page.textContent('body');
    expect(content).toContain('明石');
    await page.screenshot({ path: 'tests/screenshots/03-spot-detail.png', fullPage: false });
  });

  test('魚種図鑑ページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/fish`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/04-fish.png', fullPage: false });
  });

  test('魚種詳細ページ（アジ）', async ({ page }) => {
    const res = await page.goto(`${BASE}/fish/aji`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    const content = await page.textContent('body');
    expect(content).toContain('アジ');
    await page.screenshot({ path: 'tests/screenshots/05-fish-detail.png', fullPage: false });
  });

  test('ブログ一覧ページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/blog`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/06-blog.png', fullPage: false });
  });

  test('都道府県ページ（兵庫県）', async ({ page }) => {
    const res = await page.goto(`${BASE}/prefecture/hyogo`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    const content = await page.textContent('body');
    expect(content).toContain('兵庫');
    await page.screenshot({ path: 'tests/screenshots/07-prefecture.png', fullPage: false });
  });

  test('釣りカレンダーページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/fishing-calendar`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/08-calendar.png', fullPage: false });
  });

  test('ガイドページ（サビキ釣り）', async ({ page }) => {
    const res = await page.goto(`${BASE}/guide/sabiki`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    const content = await page.textContent('body');
    expect(content).toContain('サビキ');
    await page.screenshot({ path: 'tests/screenshots/09-guide.png', fullPage: false });
  });

  test('月別ガイド（3月）', async ({ page }) => {
    const res = await page.goto(`${BASE}/monthly/march`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/10-monthly.png', fullPage: false });
  });

  test('aboutページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await page.screenshot({ path: 'tests/screenshots/11-about.png', fullPage: false });
  });

  test('404ページ', async ({ page }) => {
    const res = await page.goto(`${BASE}/nonexistent-page-12345`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(404);
    await page.screenshot({ path: 'tests/screenshots/12-404.png', fullPage: false });
  });

  test('API: IndexNow', async ({ page }) => {
    const res = await page.goto(`${BASE}/api/indexnow`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
  });

  test('OGP画像が生成される', async ({ page }) => {
    const res = await page.goto(`${BASE}/api/og?title=テスト&emoji=🐟`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
  });

  test('レスポンスヘッダーのセキュリティ確認', async ({ page }) => {
    const res = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const headers = res?.headers() || {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });

});
