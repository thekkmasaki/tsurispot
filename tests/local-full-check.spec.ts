import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';

test('トップページ', async ({ page }) => {
  const res = await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/ツリスポ/);
});

test('スポット詳細（akashi-port）修正確認', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/akashi-port`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(res?.status()).toBe(200);
  const title = await page.title();
  console.log(`akashi-port title: ${title}`);
  expect(title).not.toContain('見つかりません');
});

test('スポット詳細（maiko-park）', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/maiko-park`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const title = await page.title();
  console.log(`maiko-park title: ${title}`);
  expect(title).not.toContain('見つかりません');
});

test('魚種詳細（アジ）', async ({ page }) => {
  const res = await page.goto(`${BASE}/fish/aji`, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
});

test('ブログ一覧', async ({ page }) => {
  const res = await page.goto(`${BASE}/blog`, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
});

test('都道府県（兵庫）', async ({ page }) => {
  const res = await page.goto(`${BASE}/prefecture/hyogo`, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
});
