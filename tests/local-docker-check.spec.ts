import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';

test('ローカルDocker: akashi-port確認', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/akashi-port`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(`status: ${res?.status()}`);
  const title = await page.title();
  console.log(`title: ${title}`);
  const has404 = title.includes('見つかりません');
  console.log(`is 404: ${has404}`);
  if (!has404) {
    const h1 = await page.locator('h1').first().textContent();
    console.log(`h1: ${h1}`);
  }
});
