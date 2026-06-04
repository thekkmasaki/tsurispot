import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Stripe クライアントを null（＝STRIPE_SECRET_KEY 未設定相当）にモック
vi.mock("@/lib/stripe", () => ({ stripe: null }));

// DynamoDB / shop-plan は import 時の AWS SDK 初期化やデータ層ロードを避けるためモック
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbPut: vi.fn(),
  dbExists: vi.fn(),
}));
vi.mock("@/lib/shop-plan", () => ({
  getStripeCustomerId: vi.fn(),
  setStripeCustomerId: vi.fn(),
  getShopSubscription: vi.fn(),
  getShopSlugByCustomerId: vi.fn(),
  updateSubscription: vi.fn(),
}));

import { POST as checkoutPOST } from "../stripe/checkout/route";
import { POST as webhookPOST } from "../stripe/webhook/route";
import { POST as portalPOST } from "../stripe/portal/route";

function makeReq(path: string, body: unknown, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...(headers ? { headers } : {}),
  });
}

describe("Stripe billing API（環境変数未設定時の防御）", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("checkout", () => {
    it("不正な JSON body で 400", async () => {
      const res = await checkoutPOST(makeReq("/api/stripe/checkout", "invalid{{{"));
      expect(res.status).toBe(400);
    });

    it("必須フィールド欠落で 400", async () => {
      const res = await checkoutPOST(makeReq("/api/stripe/checkout", { shopSlug: "x" }));
      expect(res.status).toBe(400);
    });

    it("不正な plan で 400", async () => {
      const res = await checkoutPOST(
        makeReq("/api/stripe/checkout", { shopSlug: "x", plan: "enterprise", token: "t" })
      );
      expect(res.status).toBe(400);
    });

    it("Stripe 環境変数が未設定なら 503（決済不可・サイレント失敗しない）", async () => {
      const res = await checkoutPOST(
        makeReq("/api/stripe/checkout", { shopSlug: "sample-basic", plan: "basic", token: "demo" })
      );
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toContain("決済");
    });
  });

  describe("webhook", () => {
    it("署名ヘッダ無しで 400", async () => {
      const res = await webhookPOST(makeReq("/api/stripe/webhook", "{}"));
      expect(res.status).toBe(400);
    });

    it("環境変数未設定（署名検証不可）なら 503", async () => {
      const res = await webhookPOST(
        makeReq("/api/stripe/webhook", "{}", { "stripe-signature": "test-sig" })
      );
      expect(res.status).toBe(503);
    });
  });

  describe("portal", () => {
    it("必須フィールド欠落で 400", async () => {
      const res = await portalPOST(makeReq("/api/stripe/portal", { shopSlug: "x" }));
      expect(res.status).toBe(400);
    });

    it("Stripe 環境変数が未設定なら 503", async () => {
      const res = await portalPOST(
        makeReq("/api/stripe/portal", { shopSlug: "sample-basic", token: "demo" })
      );
      expect(res.status).toBe(503);
    });
  });
});
