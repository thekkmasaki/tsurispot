import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// DynamoDB モック
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbPut: vi.fn(),
  dbIncr: vi.fn(),
}));

// shops モック - sample-premium/basic/free のみ存在扱い
vi.mock("@/lib/data/shops", () => ({
  getShopBySlug: vi.fn((slug: string) => {
    const demos: Record<string, { slug: string; planLevel: string; baitStock: { name: string; available: boolean }[] }> = {
      "sample-premium": { slug: "sample-premium", planLevel: "pro", baitStock: [{ name: "アオイソメ", available: true }] },
      "sample-basic": { slug: "sample-basic", planLevel: "basic", baitStock: [] },
      "sample-free": { slug: "sample-free", planLevel: "free", baitStock: [] },
    };
    return demos[slug] ?? undefined;
  }),
}));

import { GET, POST } from "../bait-stock/route";
import { dbGet, dbPut, dbIncr } from "@/lib/dynamodb";

describe("bait-stock API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("shop パラメータなしで 400", async () => {
      const req = new NextRequest("http://localhost/api/bait-stock");
      const res = await GET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("DynamoDB にデータがある場合 live=true で返す", async () => {
      const mockStock = [{ name: "アオイソメ", available: true, updatedAt: "3/21 10:00" }];
      vi.mocked(dbGet).mockResolvedValue(mockStock);

      const req = new NextRequest("http://localhost/api/bait-stock?shop=sample-premium");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(true);
      expect(data.stock).toEqual(mockStock);
      expect(data.shop).toBe("sample-premium");
    });

    it("DynamoDB にデータがない場合は静的データにフォールバック (live=false)", async () => {
      vi.mocked(dbGet).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/bait-stock?shop=sample-premium");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(false);
      expect(data.stock).toEqual([{ name: "アオイソメ", available: true }]);
    });

    it("存在しない shop でも 200 (空の静的データ)", async () => {
      vi.mocked(dbGet).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/bait-stock?shop=nonexistent");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(false);
      expect(data.stock).toEqual([]);
    });

    it("DynamoDB エラー時も静的データにフォールバック", async () => {
      vi.mocked(dbGet).mockRejectedValue(new Error("connection failed"));

      const req = new NextRequest("http://localhost/api/bait-stock?shop=sample-premium");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.live).toBe(false);
    });
  });

  describe("POST", () => {
    it("デモ店舗はトークン不要で在庫更新成功", async () => {
      vi.mocked(dbIncr).mockResolvedValue(1);
      vi.mocked(dbPut).mockResolvedValue(undefined);

      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "sample-premium",
          token: "any-token",
          stock: [{ name: "アオイソメ", available: true }],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.stock).toBeDefined();
      expect(data.stock[0].updatedAt).toBeDefined();
    });

    it("不正な JSON body で 400", async () => {
      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: "invalid json{{{",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("shop 未指定で 400", async () => {
      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({ token: "t", stock: [] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("token 未指定で 400", async () => {
      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({ shop: "sample-premium", stock: [] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("stock が配列でないと 400", async () => {
      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "sample-premium",
          token: "any",
          stock: "not-an-array",
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("非デモ店舗で無効なトークンは 403", async () => {
      vi.mocked(dbGet).mockResolvedValue("correct-token");

      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "some-real-shop",
          token: "wrong-token",
          stock: [{ name: "アオイソメ", available: true }],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("非デモ店舗で DynamoDB にトークンがない場合も 403", async () => {
      vi.mocked(dbGet).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "some-real-shop",
          token: "some-token",
          stock: [{ name: "アオイソメ", available: true }],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("存在しない shop で 404", async () => {
      vi.mocked(dbGet).mockResolvedValue("valid-token");
      vi.mocked(dbIncr).mockResolvedValue(1);
      vi.mocked(dbPut).mockResolvedValue(undefined);

      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "nonexistent-shop",
          token: "valid-token",
          stock: [{ name: "アオイソメ", available: true }],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it("レートリミット超過で 429", async () => {
      vi.mocked(dbIncr).mockResolvedValue(101);
      vi.mocked(dbPut).mockResolvedValue(undefined);

      const req = new NextRequest("http://localhost/api/bait-stock", {
        method: "POST",
        body: JSON.stringify({
          shop: "sample-premium",
          token: "any",
          stock: [{ name: "アオイソメ", available: true }],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
    });
  });
});
