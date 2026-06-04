import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbPut: vi.fn(),
  dbBatchGet: vi.fn(),
}));
vi.mock("@/lib/data/shops", () => ({
  getShopBySlug: vi.fn((slug: string) => {
    const m: Record<string, { slug: string; planLevel: string }> = {
      "sample-basic": { slug: "sample-basic", planLevel: "basic" },
      "real-shop": { slug: "real-shop", planLevel: "free" },
    };
    return m[slug];
  }),
}));

import { POST as verifyPOST } from "../shop-auth/verify/route";
import { POST as adminPOST } from "../admin/shop-token/route";
import { dbGet } from "@/lib/dynamodb";

function req(path: string, body: unknown, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...(headers ? { headers } : {}),
  });
}

describe("shop-auth/verify", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shop/token 欠落で 400", async () => {
    const res = await verifyPOST(req("/api/shop-auth/verify", { shop: "x" }));
    expect(res.status).toBe(400);
  });

  it("サンプル店舗 + demo トークンで ok（DBを引かず通過）", async () => {
    vi.mocked(dbGet).mockResolvedValue(null);
    const res = await verifyPOST(req("/api/shop-auth/verify", { shop: "sample-basic", token: "demo" }));
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.ok).toBe(true);
    expect(d.plan).toBe("basic");
  });

  it("実店舗で DBトークン一致なら ok", async () => {
    vi.mocked(dbGet).mockResolvedValue("secret-token");
    const res = await verifyPOST(req("/api/shop-auth/verify", { shop: "real-shop", token: "secret-token" }));
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.ok).toBe(true);
  });

  it("トークン不一致で 403", async () => {
    vi.mocked(dbGet).mockResolvedValue("secret-token");
    const res = await verifyPOST(req("/api/shop-auth/verify", { shop: "real-shop", token: "wrong" }));
    expect(res.status).toBe(403);
  });
});

describe("admin/shop-token", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Authorization ヘッダ無しで 401", async () => {
    const res = await adminPOST(req("/api/admin/shop-token", { shop: "real-shop" }));
    expect(res.status).toBe(401);
  });
});
