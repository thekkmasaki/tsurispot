import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// DynamoDB をインメモリのMapで代替（pk|sk → data）
const store = new Map<string, unknown>();
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(async (pk: string, sk: string) => store.get(`${pk}|${sk}`) ?? null),
  dbPut: vi.fn(async (pk: string, sk: string, data: unknown) => {
    store.set(`${pk}|${sk}`, data);
  }),
  dbDelete: vi.fn(async (pk: string, sk: string) => {
    store.delete(`${pk}|${sk}`);
  }),
  dbIncr: vi.fn(async () => 1),
  dbBatchGet: vi.fn(async () => []),
}));
vi.mock("@/lib/data/shops", () => ({
  getShopBySlug: vi.fn(() => ({ planLevel: "free" })),
}));

import { POST as sessionPOST, DELETE as sessionDELETE } from "@/app/api/shop-auth/session/route";
import { POST as verifyPOST } from "@/app/api/shop-auth/verify/route";
import { POST as subscriptionPOST, GET as subscriptionGET } from "@/app/api/stripe/subscription/route";
import { getShopFromSession, verifyShopAuth, SHOP_SESSION_COOKIE } from "@/lib/shop-session";
import { dbPut } from "@/lib/dynamodb";

const TOKEN = "real-owner-token-abc";

function post(path: string, body: unknown, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: cookie ? { cookie } : {},
  });
}

/** セッション交換を行い、Set-Cookie の shop_session 値を返す */
async function login(shop = "real-shop", token = TOKEN): Promise<{ status: number; id?: string; setCookie: string }> {
  const res = await sessionPOST(post("/api/shop-auth/session", { shop, token }));
  const setCookie = res.headers.get("set-cookie") ?? "";
  const m = setCookie.match(new RegExp(`${SHOP_SESSION_COOKIE}=([^;]*)`));
  return { status: res.status, id: m?.[1], setCookie };
}

describe("店舗オーナー セッション交換（/api/shop-auth/session）", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
    store.set("SHOP#real-shop|TOKEN", TOKEN);
  });

  it("正しいトークンで HttpOnly/Secure/SameSite=Lax の Cookie を発行し、値は生トークンではない", async () => {
    const { status, id, setCookie } = await login();
    expect(status).toBe(200);
    expect(id).toBeTruthy();
    expect(id).not.toContain(TOKEN);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Secure/i);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(setCookie).toMatch(/Max-Age=2592000/);
    // DynamoDB にも生トークン・生セッションIDを保存しない
    const [pk, , data] = vi.mocked(dbPut).mock.calls[0];
    expect(pk).not.toContain(id!);
    expect(JSON.stringify(data)).not.toContain(TOKEN);
  });

  it("誤ったトークンでは 403 で Cookie を発行しない", async () => {
    const { status, setCookie } = await login("real-shop", "wrong");
    expect(status).toBe(403);
    expect(setCookie).toBe("");
  });

  it("shop/token 欠落は 400", async () => {
    const res = await sessionPOST(post("/api/shop-auth/session", { shop: "real-shop" }));
    expect(res.status).toBe(400);
  });

  it("Cookie だけで verify / subscription(POST・GET) が通る", async () => {
    const { id } = await login();
    const cookie = `${SHOP_SESSION_COOKIE}=${id}`;
    const v = await verifyPOST(post("/api/shop-auth/verify", { shop: "real-shop" }, cookie));
    expect(v.status).toBe(200);
    const s = await subscriptionPOST(post("/api/stripe/subscription", { shop: "real-shop" }, cookie));
    expect(s.status).toBe(200);
    const g = await subscriptionGET(
      new NextRequest("http://localhost/api/stripe/subscription?shop=real-shop", { headers: { cookie } }),
    );
    expect(g.status).toBe(200);
  });

  it("subscription GET は後方互換で ?token= も受け付ける", async () => {
    const g = await subscriptionGET(
      new NextRequest(`http://localhost/api/stripe/subscription?shop=real-shop&token=${TOKEN}`),
    );
    expect(g.status).toBe(200);
  });

  it("他店舗の Cookie では通らない", async () => {
    store.set("SHOP#other-shop|TOKEN", "other-token");
    const { id } = await login();
    const req = post("/api/shop-auth/verify", { shop: "other-shop" }, `${SHOP_SESSION_COOKIE}=${id}`);
    expect(await verifyShopAuth(req, "other-shop")).toBe(false);
  });

  it("店舗トークンを再発行すると既存セッションは無効になる", async () => {
    const { id } = await login();
    store.set("SHOP#real-shop|TOKEN", "rotated-token");
    const req = post("/x", {}, `${SHOP_SESSION_COOKIE}=${id}`);
    expect(await getShopFromSession(req)).toBeNull();
  });

  it("期限切れセッションは無効（DynamoDB TTL の削除遅延に依存しない）", async () => {
    const { id } = await login();
    for (const [k, v] of store) {
      if (k.startsWith("SHOPSESSION#")) store.set(k, { ...(v as object), exp: Date.now() - 1 });
    }
    const req = post("/x", {}, `${SHOP_SESSION_COOKIE}=${id}`);
    expect(await getShopFromSession(req)).toBeNull();
  });

  it("形式不正・未知の Cookie は null", async () => {
    expect(await getShopFromSession(post("/x", {}, `${SHOP_SESSION_COOKIE}=abc`))).toBeNull();
    expect(
      await getShopFromSession(post("/x", {}, `${SHOP_SESSION_COOKIE}=${"A".repeat(43)}`)),
    ).toBeNull();
  });

  it("DELETE でセッションを破棄し Cookie を消す", async () => {
    const { id } = await login();
    const cookie = `${SHOP_SESSION_COOKIE}=${id}`;
    const res = await sessionDELETE(
      new NextRequest("http://localhost/api/shop-auth/session", { method: "DELETE", headers: { cookie } }),
    );
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/);
    expect(await getShopFromSession(post("/x", {}, cookie))).toBeNull();
  });
});
