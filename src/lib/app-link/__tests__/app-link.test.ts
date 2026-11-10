import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---- 簡易インメモリ Redis（TTL は fake timer の Date.now で判定）----
const fake = vi.hoisted(() => {
  const kv = new Map<string, { v: unknown; exp: number | null }>();
  const sets = new Map<string, Set<string>>();
  const live = (k: string) => {
    const e = kv.get(k);
    if (!e) return undefined;
    if (e.exp !== null && e.exp <= Date.now()) {
      kv.delete(k);
      return undefined;
    }
    return e;
  };
  const redis = {
    set: async (k: string, v: unknown, o?: { ex?: number }) => {
      kv.set(k, { v, exp: o?.ex ? Date.now() + o.ex * 1000 : null });
      return "OK";
    },
    get: async (k: string) => live(k)?.v ?? null,
    getdel: async (k: string) => {
      const e = live(k);
      kv.delete(k);
      return e?.v ?? null;
    },
    mget: async (...ks: string[]) => ks.map((k) => live(k)?.v ?? null),
    del: async (...ks: string[]) => {
      ks.forEach((k) => {
        kv.delete(k);
        sets.delete(k);
      });
      return ks.length;
    },
    sadd: async (k: string, m: string) => {
      if (!sets.has(k)) sets.set(k, new Set());
      sets.get(k)!.add(m);
      return 1;
    },
    srem: async (k: string, m: string) => (sets.get(k)?.delete(m) ? 1 : 0),
    smembers: async (k: string) => [...(sets.get(k) ?? [])],
    expire: async () => 1,
  };
  return { kv, sets, redis };
});

vi.mock("@/lib/redis", () => ({ redis: fake.redis }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/user-store", () => ({
  getUserById: vi.fn(async (id: string) => ({ id, nickname: `nick-${id}`, avatarUrl: undefined, reportCount: 3 })),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { auth } from "@/lib/auth";
import {
  createAppToken,
  issueAuthCode,
  redeemAuthCode,
  revokeAllAppTokens,
  revokeAppToken,
  sha256b64url,
  sha256hex,
  verifyAppToken,
} from "../store";
import { getRequestUser } from "../request-user";
import { resolveLoginRedirect } from "../config";
import { parseAppLinkReq } from "../req-cookie";
import { setUserBanned, markUserDeleted } from "@/lib/user-status";
import { POST as tokenPOST, DELETE as tokenDELETE } from "@/app/api/app/token/route";
import { GET as meGET } from "@/app/api/app/me/route";
import { GET as startGET } from "@/app/api/app/link/start/route";
import { POST as approvePOST } from "@/app/api/app/link/approve/route";
import { NextRequest } from "next/server";

const VERIFIER = "v".repeat(43);
const CHALLENGE = sha256b64url(VERIFIER);

function jsonReq(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/app/token", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
const bearerReq = (token: string, method = "GET", path = "/api/app/me") =>
  new NextRequest(`http://localhost${path}`, { method, headers: { authorization: `Bearer ${token}` } });

describe("アプリ連携", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-10T00:00:00Z"));
    fake.kv.clear();
    fake.sets.clear();
    vi.stubEnv("APP_LINK_ENABLED", "true");
    vi.mocked(auth).mockResolvedValue(null as never);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe("認可コード", () => {
    it("コードは1回しか使えない", async () => {
      const code = await issueAuthCode("u1", CHALLENGE);
      expect(await redeemAuthCode(code, VERIFIER)).toBe("u1");
      expect(await redeemAuthCode(code, VERIFIER)).toBeNull();
    });

    it("コードはハッシュをキーにして保存される（平文は保存しない）", async () => {
      const code = await issueAuthCode("u1", CHALLENGE);
      expect(fake.kv.has(`auth:app_code:${sha256hex(code)}`)).toBe(true);
      expect([...fake.kv.keys()].some((k) => k.includes(code))).toBe(false);
    });

    it("verifier 不一致は拒否し、コードも消費される", async () => {
      const code = await issueAuthCode("u1", CHALLENGE);
      expect(await redeemAuthCode(code, "x".repeat(43))).toBeNull();
      expect(await redeemAuthCode(code, VERIFIER)).toBeNull();
    });

    it("60秒を過ぎると拒否", async () => {
      const code = await issueAuthCode("u1", CHALLENGE);
      vi.advanceTimersByTime(61_000);
      expect(await redeemAuthCode(code, VERIFIER)).toBeNull();
    });
  });

  describe("トークン", () => {
    it("ハッシュ保存・検証・失効", async () => {
      const token = await createAppToken("u1", "iPhone");
      expect(token).toMatch(/^tsa_[A-Za-z0-9_-]{43}$/);
      const h = sha256hex(token);
      expect(fake.kv.has(`auth:app_token:${h}`)).toBe(true);
      expect([...fake.kv.keys()].some((k) => k.includes(token))).toBe(false);
      expect(fake.sets.get("auth:user_app_tokens:u1")?.has(h)).toBe(true);

      expect((await verifyAppToken(token))?.tsuriId).toBe("u1");
      await revokeAppToken("u1", h);
      expect(await verifyAppToken(token)).toBeNull();
      expect(fake.sets.get("auth:user_app_tokens:u1")?.has(h)).toBe(false);
    });

    it("1人10個まで。超えたら古いものから失効", async () => {
      const tokens: string[] = [];
      for (let i = 0; i < 11; i++) {
        vi.advanceTimersByTime(1000);
        tokens.push(await createAppToken("u1", null));
      }
      expect(fake.sets.get("auth:user_app_tokens:u1")?.size).toBe(10);
      expect(await verifyAppToken(tokens[0])).toBeNull();
      expect(await verifyAppToken(tokens[10])).not.toBeNull();
    });

    it("lastSeenAt は24時間より古い時だけ更新される", async () => {
      const token = await createAppToken("u1", null);
      const key = `auth:app_token:${sha256hex(token)}`;
      const before = (fake.kv.get(key)!.v as { lastSeenAt: string }).lastSeenAt;
      vi.advanceTimersByTime(60 * 60 * 1000);
      await verifyAppToken(token);
      expect((fake.kv.get(key)!.v as { lastSeenAt: string }).lastSeenAt).toBe(before);
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);
      await verifyAppToken(token);
      expect((fake.kv.get(key)!.v as { lastSeenAt: string }).lastSeenAt).not.toBe(before);
    });

    it("90日で期限切れ", async () => {
      const token = await createAppToken("u1", null);
      vi.advanceTimersByTime(91 * 24 * 60 * 60 * 1000);
      expect(await verifyAppToken(token)).toBeNull();
    });

    it("revokeAll で全部消える", async () => {
      const a = await createAppToken("u1", null);
      const b = await createAppToken("u1", null);
      await revokeAllAppTokens("u1");
      expect(await verifyAppToken(a)).toBeNull();
      expect(await verifyAppToken(b)).toBeNull();
    });

    it("利用停止・退会でトークンが通らなくなる / ban 時は全失効", async () => {
      const token = await createAppToken("u1", null);
      await markUserDeleted("u1");
      expect((await getRequestUser(bearerReq(token))).kind).toBe("unauthorized");

      fake.kv.delete("auth:user_status:u1");
      const t2 = await createAppToken("u2", null);
      await setUserBanned("u2");
      expect(await verifyAppToken(t2)).toBeNull();
    });
  });

  describe("getRequestUser", () => {
    it("有効な Bearer は app として解決", async () => {
      const token = await createAppToken("u1", null);
      const r = await getRequestUser(bearerReq(token));
      expect(r).toEqual({
        kind: "user",
        user: { tsuriId: "u1", nickname: "nick-u1", avatarUrl: null, via: "app" },
      });
    });

    it("無効な Bearer は匿名に落とさず unauthorized", async () => {
      const r = await getRequestUser(bearerReq("tsa_" + "z".repeat(43)));
      expect(r.kind).toBe("unauthorized");
    });

    it("スイッチ OFF では Bearer を無視して Cookie セッションを見る", async () => {
      vi.stubEnv("APP_LINK_ENABLED", "false");
      const token = await createAppToken("u1", null);
      expect((await getRequestUser(bearerReq(token))).kind).toBe("anonymous");
      vi.mocked(auth).mockResolvedValue({
        user: { tsuriId: "c1", nickname: "cookie", avatarUrl: undefined },
      } as never);
      const r = await getRequestUser(bearerReq("tsa_bad"));
      expect(r).toEqual({
        kind: "user",
        user: { tsuriId: "c1", nickname: "cookie", avatarUrl: null, via: "cookie" },
      });
    });

    it("Bearer なしは Cookie セッション", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "c1", nickname: "n" } } as never);
      const r = await getRequestUser(new Request("http://localhost/x"));
      expect(r.kind === "user" && r.user.via).toBe("cookie");
    });
  });

  describe("エンドポイント", () => {
    it("スイッチ OFF では全て 404", async () => {
      vi.stubEnv("APP_LINK_ENABLED", "");
      expect((await startGET(new NextRequest("http://localhost/api/app/link/start"))).status).toBe(404);
      expect((await approvePOST(new NextRequest("http://localhost/api/app/link/approve", { method: "POST" }))).status).toBe(404);
      expect((await tokenPOST(jsonReq({}))).status).toBe(404);
      expect((await tokenDELETE(bearerReq("tsa_x", "DELETE", "/api/app/token"))).status).toBe(404);
      expect((await meGET(bearerReq("tsa_x"))).status).toBe(404);
    });

    it("start: 形式不正は 400、正しければ Cookie を付けて /app-link へ 302", async () => {
      const bad = await startGET(new NextRequest("http://localhost/api/app/link/start?challenge=x&state=y"));
      expect(bad.status).toBe(400);
      const state = "s".repeat(20);
      const ok = await startGET(
        new NextRequest(`http://localhost/api/app/link/start?challenge=${CHALLENGE}&state=${state}`),
      );
      expect(ok.status).toBe(302);
      expect(ok.headers.get("location")).toBe("/app-link");
      const setCookie = ok.headers.get("set-cookie") ?? "";
      expect(setCookie).toMatch(/app_link_req=/);
      expect(setCookie).toMatch(/HttpOnly/i);
      expect(setCookie).toMatch(/Secure/i);
      expect(setCookie).toMatch(/SameSite=lax/i);
      expect(setCookie).toMatch(/Max-Age=600/i);
      const value = /app_link_req=([^;]+)/.exec(setCookie)![1];
      expect(parseAppLinkReq(value)).toMatchObject({ challenge: CHALLENGE, state });
    });

    async function cookieValue() {
      const state = "s".repeat(20);
      const res = await startGET(
        new NextRequest(`http://localhost/api/app/link/start?challenge=${CHALLENGE}&state=${state}`),
      );
      return /app_link_req=([^;]+)/.exec(res.headers.get("set-cookie")!)![1];
    }
    function approveReq(cookie: string, nonce: string, origin: string | null) {
      const form = new URLSearchParams({ nonce });
      const headers: Record<string, string> = {
        cookie: `app_link_req=${cookie}`,
        "content-type": "application/x-www-form-urlencoded",
      };
      if (origin) headers.origin = origin;
      return new NextRequest("http://localhost/api/app/link/approve", { method: "POST", headers, body: form });
    }

    it("approve → token の一連の流れ（コード1回きり・verifier 不一致は 401）", async () => {
      const cookie = await cookieValue();
      const info = parseAppLinkReq(cookie)!;
      vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1", nickname: "n" } } as never);

      const res = await approvePOST(approveReq(cookie, info.nonce, "http://localhost"));
      expect(res.status).toBe(303);
      const loc = new URL(res.headers.get("location")!);
      expect(loc.protocol).toBe("com.tsurispot.catchlog:");
      expect(loc.searchParams.get("state")).toBe(info.state);
      const code = loc.searchParams.get("code")!;

      const bad = await tokenPOST(jsonReq({ code, verifier: "x".repeat(43) }));
      expect(bad.status).toBe(401);
      expect(await bad.json()).toEqual({ ok: false, error: "invalid_code" });

      // 不一致でコードは消費済み → 正しい verifier でももう使えない
      expect((await tokenPOST(jsonReq({ code, verifier: VERIFIER }))).status).toBe(401);

      // 改めて発行して成功させる
      const cookie2 = await cookieValue();
      const info2 = parseAppLinkReq(cookie2)!;
      const res2 = await approvePOST(approveReq(cookie2, info2.nonce, "http://localhost"));
      const code2 = new URL(res2.headers.get("location")!).searchParams.get("code")!;
      const ok = await tokenPOST(jsonReq({ code: code2, verifier: VERIFIER, deviceName: "iPhone" }));
      expect(ok.status).toBe(200);
      const body = await ok.json();
      expect(body).toMatchObject({ ok: true, expiresInDays: 90, user: { nickname: "nick-u1", avatarUrl: null } });
      expect(body.token).toMatch(/^tsa_/);

      const me = await meGET(bearerReq(body.token));
      expect(me.status).toBe(200);
      expect(await me.json()).toEqual({ ok: true, user: { nickname: "nick-u1", avatarUrl: null, reportCount: 3 } });

      const del = await tokenDELETE(bearerReq(body.token, "DELETE", "/api/app/token"));
      expect(del.status).toBe(200);
      expect((await meGET(bearerReq(body.token))).status).toBe(401);
      expect((await tokenDELETE(bearerReq(body.token, "DELETE", "/api/app/token"))).status).toBe(200);
    });

    it("approve: Origin 違い・nonce 違い・未ログイン・停止中は 403 でコードを発行しない", async () => {
      const cookie = await cookieValue();
      const info = parseAppLinkReq(cookie)!;
      vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1", nickname: "n" } } as never);
      expect((await approvePOST(approveReq(cookie, info.nonce, "https://evil.example"))).status).toBe(403);
      expect((await approvePOST(approveReq(cookie, info.nonce, null))).status).toBe(403);
      expect((await approvePOST(approveReq(cookie, "n".repeat(16), "http://localhost"))).status).toBe(403);

      vi.mocked(auth).mockResolvedValue(null as never);
      expect((await approvePOST(approveReq(cookie, info.nonce, "http://localhost"))).status).toBe(403);

      vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1", nickname: "n" } } as never);
      await markUserDeleted("u1");
      expect((await approvePOST(approveReq(cookie, info.nonce, "http://localhost"))).status).toBe(403);

      expect([...fake.kv.keys()].some((k) => k.startsWith("auth:app_code:"))).toBe(false);
    });

    it("approve: 本番では https://tsurispot.com 以外の Origin を通さない（内部ホスト名も不可）", async () => {
      const cookie = await cookieValue();
      const info = parseAppLinkReq(cookie)!;
      vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1", nickname: "n" } } as never);
      vi.stubEnv("NODE_ENV", "production");
      try {
        expect((await approvePOST(approveReq(cookie, info.nonce, "http://localhost"))).status).toBe(403);
        expect([...fake.kv.keys()].some((k) => k.startsWith("auth:app_code:"))).toBe(false);
        expect((await approvePOST(approveReq(cookie, info.nonce, "https://tsurispot.com"))).status).toBe(303);
      } finally {
        vi.stubEnv("NODE_ENV", "test");
      }
    });

    it("token: 停止中ユーザーは 403 inactive、形式不正は 400", async () => {
      const code = await issueAuthCode("u1", CHALLENGE);
      await markUserDeleted("u1");
      const res = await tokenPOST(jsonReq({ code, verifier: VERIFIER }));
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ ok: false, error: "inactive" });

      expect((await tokenPOST(jsonReq({ code: "short", verifier: VERIFIER }))).status).toBe(400);
      expect((await tokenPOST(jsonReq({ code, verifier: "short" }))).status).toBe(400);
    });

    it("me: Bearer なし・無効は 401", async () => {
      expect((await meGET(new NextRequest("http://localhost/api/app/me"))).status).toBe(401);
      const r = await meGET(bearerReq("tsa_" + "q".repeat(43)));
      expect(r.status).toBe(401);
      expect(await r.json()).toEqual({ ok: false, error: "unauthorized" });
    });
  });

  describe("/login の戻り先", () => {
    it("固定の2つ以外にならない", () => {
      expect(resolveLoginRedirect(true, true)).toBe("/app-link");
      expect(resolveLoginRedirect(true, false)).toBe("/mypage");
      expect(resolveLoginRedirect(false, true)).toBe("/mypage");
      expect(resolveLoginRedirect(false, false)).toBe("/mypage");
    });
  });
});
