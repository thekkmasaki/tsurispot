import { test, expect } from '@playwright/test';

const BASE = 'https://iy22kgsc5h.ap-northeast-1.awsapprunner.com';

test('SSG済みスポット（rating高い）を確認', async ({ page }) => {
  // rating高いスポットはSSG済みのはず
  const res = await page.goto(`${BASE}/spots/ashizuri-iso`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(`ashizuri-iso: status=${res?.status()}, title=${await page.title()}`);
  expect(res?.status()).toBe(200);
  const content = await page.textContent('body');
  expect(content).toContain('足摺');
});

test('ISR: akashi-portを長めに待って確認', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/akashi-port`, { waitUntil: 'networkidle', timeout: 60000 });
  console.log(`akashi-port: status=${res?.status()}, title=${await page.title()}`);
  const content = await page.textContent('body');
  const has404 = content?.includes('404') || content?.includes('見つかりません');
  console.log(`akashi-port is 404: ${has404}`);
});

test('別のISRスポットも確認', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/maiko-park`, { waitUntil: 'networkidle', timeout: 60000 });
  console.log(`maiko-park: status=${res?.status()}, title=${await page.title()}`);
  const content = await page.textContent('body');
  const has404 = content?.includes('404') || content?.includes('見つかりません');
  console.log(`maiko-park is 404: ${has404}`);
});
