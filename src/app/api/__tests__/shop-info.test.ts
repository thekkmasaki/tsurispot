import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Redis モック
vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

// shops モック
vi.mock("@/lib/data/shops", () => ({
  getShopBySlug: vi.fn((slug: string) => {
    const demos: Record<string, { slug: string; planLevel: string }> = {
      "sample-premium": { slug: "sample-premium", planLevel: "pro" },
      "sample-basic": { slug: "sample-basic", planLevel: "basic" },
      "sample-free": { slug: "sample-free", planLevel: "free" },
    };
    return demos[slug] ?? undefined;
  }),
}));

import { GET, POST } from "../shop-info/route";
import { redis } from "@/lib/redis";

describe("shop-info API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("shop パラメータなしで 400", async () => {
      const req = new NextRequest("http://localhost/api/shop-info");
      const res = await GET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("Redis にデータがある場合 live=true で返す", async () => {
      const mockInfo = { businessHours: "9:00-18:00", updatedAt: "3/21 10:00" };
      vi.mocked(redis.get).mockResolvedValue(mockInfo);

      const req = new NextRequest("http://localhost/api/shop-info?shop=sample-premium");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(true);
      expect(data.info).toEqual(mockInfo);
      expect(data.shop).toBe("sample-premium");
    });

    it("Redis にデータがない場合 live=false で null を返す", async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/shop-info?shop=sample-free");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(false);
      expect(data.info).toBeNull();
    });

    it("Redis エラー時も live=false で返す", async () => {
      vi.mocked(redis.get).mockRejectedValue(new Error("connection failed"));

      const req = new NextRequest("http://localhost/api/shop-info?shop=sample-premium");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(false);
      expect(data.info).toBeNull();
    });
  });

  describe("POST", () => {
    it("デモ店舗で情報更新成功", async () => {
      vi.mocked(redis.incr).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({
          shop: "sample-premium",
          token: "any-token",
          info: { businessHours: "10:00-20:00" },
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.info).toBeDefined();
      expect(data.info.businessHours).toBe("10:00-20:00");
      expect(data.info.updatedAt).toBeDefined();
    });

    it("必須フィールドなしで 400", async () => {
      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({ shop: "sample-premium", token: "t" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("非デモ店舗で無効トークンは 403", async () => {
      vi.mocked(redis.get).mockResolvedValue("correct-token");

      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({
          shop: "some-real-shop",
          token: "wrong-token",
          info: { businessHours: "9:00-18:00" },
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("非デモ店舗で Redis にトークンがない場合も 403", async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({
          shop: "some-real-shop",
          token: "some-token",
          info: { businessHours: "9:00-18:00" },
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("存在しない shop で 404 (正しいトークンでも)", async () => {
      vi.mocked(redis.get).mockResolvedValue("valid-token");
      vi.mocked(redis.incr).mockResolvedValue(1);
      vi.mocked(redis.expire).mockResolvedValue(1);

      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({
          shop: "nonexistent-shop",
          token: "valid-token",
          info: { businessHours: "9:00-18:00" },
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it("レートリミット超過で 429", async () => {
      vi.mocked(redis.incr).mockResolvedValue(101);
      vi.mocked(redis.set).mockResolvedValue("OK");

      const req = new NextRequest("http://localhost/api/shop-info", {
        method: "POST",
        body: JSON.stringify({
          shop: "sample-premium",
          token: "any",
          info: { businessHours: "10:00-20:00" },
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
    });
  });
});
