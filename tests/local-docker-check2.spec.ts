import { test, expect } from '@playwright/test';

// ローカルDockerで確認
const BASE = 'http://localhost:3001';

test('マニフェスト内のSSGスポット確認', async ({ page }) => {
  // prerender-manifestに存在するスポット
  const slugs = ['abashiri-ko', 'akashi-kaikyo-bridge-shita', 'akashi-shinhato'];
  for (const slug of slugs) {
    const res = await page.goto(`${BASE}/spots/${slug}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    const is404 = title.includes('見つかりません');
    console.log(`${slug}: status=${res?.status()}, 404=${is404}, title=${title.substring(0, 50)}`);
  }
});

test('ISRスポット（akashi-port）', async ({ page }) => {
  const res = await page.goto(`${BASE}/spots/akashi-port`, { waitUntil: 'networkidle', timeout: 60000 });
  const title = await page.title();
  console.log(`akashi-port: status=${res?.status()}, title=${title.substring(0, 50)}`);
});
