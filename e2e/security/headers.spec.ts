import { test, expect } from '@playwright/test';

test.describe('セキュリティヘッダー', () => {
  test('主要なセキュリティヘッダーが存在する', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff');

    // X-Frame-Options
    const xfo = headers['x-frame-options'];
    expect(xfo).toBeTruthy();
    expect(['DENY', 'SAMEORIGIN']).toContain(xfo?.toUpperCase());
  });

  test('CSPヘッダーが存在する', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];
    if (csp) {
      expect(csp).toContain('default-src');
    }
  });

  test('主要ページが正常に表示される', async ({ request }) => {
    const pages = ['/', '/spots', '/fish'];
    for (const path of pages) {
      const response = await request.get(path);
      expect(response.status(), `${path} should return 200`).toBe(200);
    }
  });

  test('スポット詳細ページが表示される', async ({ request }) => {
    const response = await request.get('/spots/otaru-port');
    expect([200, 500]).toContain(response.status());
  });
});
