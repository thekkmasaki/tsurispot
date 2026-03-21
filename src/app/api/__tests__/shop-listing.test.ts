import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Redis モック
vi.mock("@/lib/redis", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

const originalEnv = { ...process.env };

describe("shop-listing API", () => {
  let POST: typeof import("../shop-listing/route").POST;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.GAS_CATCH_REPORT_URL = "https://script.google.com/test";
    // global fetch をモック
    global.fetch = vi.fn().mockResolvedValue(new Response("ok"));
    // モジュールキャッシュをリセットして環境変数変更を反映
    vi.resetModules();
    const mod = await import("../shop-listing/route");
    POST = mod.POST;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("無料掲載申請が正しく処理される", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "test@example.com",
        businessHours: "9:00-18:00",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("店舗名なしで 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("メールアドレス不正で 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "invalid-email",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("電話番号なしで 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        address: "東京都港区1-1-1",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("住所なしで 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        phone: "03-1234-5678",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("有料プラン問い合わせ (basic) が正しく処理される", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        type: "paid_inquiry_basic",
        shopName: "テスト釣具店",
        contactName: "田中太郎",
        email: "test@example.com",
        phone: "03-1234-5678",
        message: "ベーシックプランに興味があります",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("有料プラン問い合わせ (pro) が正しく処理される", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        type: "paid_inquiry_pro",
        shopName: "テスト釣具店",
        contactName: "田中太郎",
        email: "test@example.com",
        phone: "03-1234-5678",
        message: "プロプランに興味があります",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("有料問い合わせで店舗名なしは 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        type: "paid_inquiry_basic",
        email: "test@example.com",
        phone: "03-1234-5678",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("有料問い合わせで不正メールは 400", async () => {
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        type: "paid_inquiry_pro",
        shopName: "テスト釣具店",
        email: "bad-email",
        phone: "03-1234-5678",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("GAS_URL 未設定で 503", async () => {
    delete process.env.GAS_CATCH_REPORT_URL;
    vi.resetModules();
    const mod = await import("../shop-listing/route");

    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "test@example.com",
      }),
    });
    const res = await mod.POST(req);
    expect(res.status).toBe(503);
  });

  it("GAS fetch 失敗でも 200 (エラーはログのみ)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: "テスト釣具店",
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("店舗名が50文字超で 400", async () => {
    const longName = "あ".repeat(51);
    const req = new Request("http://localhost/api/shop-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: JSON.stringify({
        shopName: longName,
        address: "東京都港区1-1-1",
        phone: "03-1234-5678",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
