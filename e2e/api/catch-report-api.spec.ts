import { test, expect } from '@playwright/test';

test.describe('釣果報告API', () => {
  test('GET /api/catch-reports - 正常取得', async ({ request }) => {
    const res = await request.get('/api/catch-reports?spot=otaru-port');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.reports)).toBe(true);
  });

  test('GET /api/catch-reports - spotなし → 400', async ({ request }) => {
    const res = await request.get('/api/catch-reports');
    expect(res.status()).toBe(400);
  });

  test('POST /api/catch-report-ugc - NGワードを含む投稿 → 400', async ({ request }) => {
    const res = await request.post('/api/catch-report-ugc', {
      data: {
        spotSlug: 'otaru-port',
        spotName: '小樽港',
        fishName: 'アジ',
        userName: 'テスター',
        comment: '死ねクソスポット',
        date: '2026-03-28',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('不適切');
  });

  test('POST /api/catch-report-ugc - URL含む投稿 → 400', async ({ request }) => {
    const res = await request.post('/api/catch-report-ugc', {
      data: {
        spotSlug: 'otaru-port',
        spotName: '小樽港',
        fishName: 'アジ',
        userName: 'スパマー',
        comment: 'https://spam.example.com で購入',
        date: '2026-03-28',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('URL');
  });

  test('POST /api/catch-report-ugc - 正常な投稿 → 200', async ({ request }) => {
    const res = await request.post('/api/catch-report-ugc', {
      data: {
        spotSlug: 'test-spot-e2e',
        spotName: 'テストスポット',
        fishName: 'アジ',
        userName: 'E2Eテスター',
        comment: '朝マヅメに3匹釣れました',
        date: '2026-03-28',
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('投稿');
  });

  test('POST /api/catch-report-ugc - 未来の日付 → 400', async ({ request }) => {
    const res = await request.post('/api/catch-report-ugc', {
      data: {
        spotSlug: 'otaru-port',
        spotName: '小樽港',
        fishName: 'アジ',
        userName: 'テスター',
        comment: 'テスト投稿です',
        date: '2099-12-31',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/catch-report-ugc - バリデーションエラー（魚名なし）→ 400', async ({ request }) => {
    const res = await request.post('/api/catch-report-ugc', {
      data: {
        spotSlug: 'otaru-port',
        spotName: '小樽港',
        fishName: '',
        userName: 'テスター',
        comment: 'テスト投稿',
        date: '2026-03-28',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/report-flag - 不正なリクエスト → 400', async ({ request }) => {
    const res = await request.post('/api/report-flag', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/report-flag - 正常な通報 → 200', async ({ request }) => {
    const res = await request.post('/api/report-flag', {
      data: {
        reportId: 'test-report-e2e',
        sessionId: 'test-session-e2e',
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  test('POST /api/admin/block-report - 認証なし → 401', async ({ request }) => {
    const res = await request.post('/api/admin/block-report', {
      data: { reportId: 'test' },
    });
    expect(res.status()).toBe(401);
  });
});
