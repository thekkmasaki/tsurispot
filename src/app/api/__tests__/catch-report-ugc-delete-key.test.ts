import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

// ─── 外部I/Oはメモリ上の DynamoDB / Redis に置き換える ───
// （保存された全データを丸ごと検査し、削除キーのハッシュが DELKEY 以外へ載らないことを確かめる）
const mem = vi.hoisted(() => ({
  db: new Map<string, { pk: string; sk: string; data: unknown }>(),
  lists: new Map<string, string[]>(),
  kv: new Map<string, string>(),
}));

vi.mock("@/lib/dynamodb", () => {
  const k = (pk: string, sk: string) => `${pk}\u0000${sk}`;
  return {
    dbGet: vi.fn(async (pk: string, sk: string) => mem.db.get(k(pk, sk))?.data ?? null),
    dbPut: vi.fn(async (pk: string, sk: string, data: unknown) => {
      // 実物と同じく JSON 互換に落として保存（参照共有による誤検知を防ぐ）
      mem.db.set(k(pk, sk), { pk, sk, data: JSON.parse(JSON.stringify(data)) });
    }),
    dbDelete: vi.fn(async (pk: string, sk: string) => {
      mem.db.delete(k(pk, sk));
    }),
    dbExists: vi.fn(async (pk: string, sk: string) => mem.db.has(k(pk, sk))),
    dbIncr: vi.fn(async (pk: string, sk: string, amount = 1) => {
      const cur = Number(mem.db.get(k(pk, sk))?.data ?? 0) + amount;
      mem.db.set(k(pk, sk), { pk, sk, data: cur });
      return cur;
    }),
    dbDecr: vi.fn(async () => 0),
    dbBatchGet: vi.fn(async (keys: { pk: string; sk: string }[]) =>
      keys.map((x) => mem.db.get(k(x.pk, x.sk))?.data ?? null),
    ),
    dbQuery: vi.fn(
      async (pk: string, opts: { skPrefix?: string; forward?: boolean; limit?: number; all?: boolean } = {}) => {
        const items = [...mem.db.values()]
          .filter((it) => it.pk === pk && (!opts.skPrefix || it.sk.startsWith(opts.skPrefix)))
          .sort((a, b) => (a.sk < b.sk ? -1 : a.sk > b.sk ? 1 : 0));
        if (!opts.forward) items.reverse();
        return !opts.all && opts.limit ? items.slice(0, opts.limit) : items;
      },
    ),
    dbConditionalPut: vi.fn(async () => true),
    dbConditionalDelete: vi.fn(async () => true),
  };
});
vi.mock("@/lib/redis", () => ({
  redis: {
    lpush: vi.fn(async (key: string, v: string) => {
      mem.lists.set(key, [v, ...(mem.lists.get(key) ?? [])]);
    }),
    ltrim: vi.fn(async (key: string, start: number, stop: number) => {
      mem.lists.set(key, (mem.lists.get(key) ?? []).slice(start, stop + 1));
    }),
    lrange: vi.fn(async (key: string, start: number, stop: number) => {
      const l = mem.lists.get(key) ?? [];
      return l.slice(start, stop === -1 ? undefined : stop + 1);
    }),
    lrem: vi.fn(async (key: string, _count: number, v: string) => {
      const l = mem.lists.get(key) ?? [];
      const i = l.indexOf(v);
      if (i >= 0) l.splice(i, 1);
    }),
    lset: vi.fn(),
    smembers: vi.fn(async () => []),
    get: vi.fn(async (key: string) => mem.kv.get(key) ?? null),
    set: vi.fn(async (key: string, v: string) => {
      mem.kv.set(key, v);
      return "OK";
    }),
    zincrby: vi.fn(),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ purgeCloudflareUrls: vi.fn() }));
vi.mock("@/lib/s3", () => ({
  deleteFromS3: vi.fn(),
  ownS3KeyFromUrl: vi.fn((u: string) => {
    const i = u.indexOf("catch-reports/");
    return i >= 0 ? u.slice(i) : null;
  }),
}));
vi.mock("@/lib/data/spots", () => ({
  getSpotBySlug: vi.fn((slug: string) =>
    slug === "test-spot" ? { slug: "test-spot", name: "テストスポット" } : undefined,
  ),
}));
vi.mock("@/lib/user-status", () => ({
  rejectInactiveUser: vi.fn().mockResolvedValue(null),
  getUserStatus: vi.fn(),
}));
vi.mock("@/lib/app-link/store", () => ({ verifyAppToken: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/user-store", () => ({
  incrementReportCount: vi.fn().mockResolvedValue(1),
  decrementReportCount: vi.fn(),
  getFollowingList: vi.fn().mockResolvedValue([]),
  getUserById: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/editorial-feed", () => ({ getEditorialCards: vi.fn().mockResolvedValue([]) }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { POST } from "../catch-report-ugc/route";
import { DELETE } from "../catch-report-ugc/[id]/route";
import { GET as getPost } from "../posts/[id]/route";
import { GET as getRecent } from "../catch-reports/recent/route";
import { GET as getTimeline } from "../timeline/route";
import { getCatchReportsBySpotAsync } from "@/lib/data/catch-reports";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteFromS3 } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { DELETE_KEY_RE, hashDeleteKey, verifyDeleteKey } from "@/lib/ugc-delete-key";
import { NextRequest } from "next/server";
import { decrementReportCount, getUserById } from "@/lib/user-store";
import { getUserStatus } from "@/lib/user-status";
import { verifyAppToken } from "@/lib/app-link/store";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

async function post(body: Record<string, unknown> = {}) {
  const res = await POST(
    new Request("http://localhost/api/catch-report-ugc", {
      method: "POST",
      body: JSON.stringify({
        spotSlug: "test-spot",
        fishName: "アジ",
        userName: "テスト太郎",
        date: "2026-07-28",
        tags: ["サビキ"],
        photoUrl: "https://tsurispot-images.s3.ap-northeast-1.amazonaws.com/catch-reports/a.jpg",
        ...body,
      }),
    }),
  );
  return { res, data: await res.json() };
}

function del(id: string, headers: Record<string, string> = {}, query = "") {
  return DELETE(
    new NextRequest(`http://localhost/api/catch-report-ugc/${id}${query}`, { method: "DELETE", headers }),
    { params: Promise.resolve({ id }) },
  );
}

/** DELKEY 以外に保存された全データ（DynamoDB・Redis）を 1 つの文字列にする */
function dumpExceptDelKey(): string {
  const db = [...mem.db.values()].filter((it) => it.sk !== "DELKEY");
  return JSON.stringify({ db, lists: [...mem.lists.entries()] });
}

beforeEach(() => {
  mem.db.clear();
  mem.lists.clear();
  mem.kv.clear();
  // 投稿に付ける写真は、同じ人（ここでは同じIP）が直近にアップしたもの
  mem.kv.set("uploadowner:catch-reports/a.jpg", `ip:${sha256("1.2.3.4").slice(0, 32)}`);
  vi.mocked(auth).mockResolvedValue(null as never);
  vi.mocked(checkRateLimit).mockResolvedValue(true);
  vi.mocked(deleteFromS3).mockClear();
  vi.mocked(revalidatePath).mockClear();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-07-28T03:00:00Z"));
});

describe("ログインしない投稿の削除キー（発行）", () => {
  it("匿名投稿は 32 バイト以上の base64url キーを 1 度だけ返し、保存は SHA-256 だけ", async () => {
    const { res, data } = await post();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(typeof data.deleteKey).toBe("string");
    expect(data.deleteKey).toMatch(DELETE_KEY_RE);
    expect(Buffer.from(data.deleteKey, "base64url").length).toBeGreaterThanOrEqual(32);

    const rec = mem.db.get(`POST#${data.id}\u0000DELKEY`)?.data as { hash: string; spotSlug: string };
    expect(rec.hash).toBe(sha256(data.deleteKey));
    expect(rec.spotSlug).toBe("test-spot");
    // キー本体はどこにも保存しない
    expect(JSON.stringify([...mem.db.values()])).not.toContain(data.deleteKey);
    expect(JSON.stringify([...mem.lists.entries()])).not.toContain(data.deleteKey);
  });

  it("ハッシュは DELKEY 以外（投稿正本・スポット別一覧・フィード・タグ・最近の釣果）に載らない", async () => {
    const { data } = await post();
    const hash = sha256(data.deleteKey);
    const dump = dumpExceptDelKey();
    expect(dump).toContain(data.id); // 投稿自体は各所に保存されている
    expect(dump).not.toContain(hash);
    expect(dump).not.toContain(data.deleteKey);
  });

  it("投稿ごとに違うキーになる", async () => {
    const a = await post();
    const b = await post();
    expect(a.data.deleteKey).not.toBe(b.data.deleteKey);
  });

  it("ログイン済み投稿には削除キーを出さない（従来どおり）", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t1", nickname: "釣り人" } } as never);
    const { res, data } = await post();
    expect(res.status).toBe(200);
    expect(data.deleteKey).toBeUndefined();
    expect([...mem.db.values()].some((it) => it.sk === "DELKEY")).toBe(false);
  });
});

describe("削除キーのハッシュが GET 応答・フィードに出ない", () => {
  it("投稿単体・最近の釣果・タイムライン・スポット別一覧のどれにも出ない", async () => {
    const { data } = await post();
    const hash = sha256(data.deleteKey);

    const single = await getPost(new NextRequest(`http://localhost/api/posts/${data.id}`), {
      params: Promise.resolve({ id: data.id }),
    });
    const singleText = await single.text();
    expect(single.status).toBe(200);
    expect(singleText).toContain(data.id);

    const recentText = await (await getRecent(new Request("http://localhost/api/catch-reports/recent?limit=20"))).text();
    expect(recentText).toContain(data.id);

    const timelineText = await (await getTimeline(new NextRequest("http://localhost/api/timeline"))).text();
    expect(timelineText).toContain(data.id);

    const spotReports = JSON.stringify(await getCatchReportsBySpotAsync("test-spot"));
    expect(spotReports).toContain(data.id);

    for (const text of [singleText, recentText, timelineText, spotReports]) {
      expect(text).not.toContain(hash);
      expect(text).not.toContain(data.deleteKey);
      expect(text).not.toContain("deleteKey");
    }
  });

  it("DELKEY を読むのは削除キーの専用モジュールだけ（ページ・JSON-LD・他 API から参照しない）", () => {
    const root = path.resolve(__dirname, "../../..");
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) {
          if (name === "__tests__" || name === "node_modules") continue;
          walk(p);
        } else if (/\.(ts|tsx)$/.test(name)) {
          const src = readFileSync(p, "utf8");
          if (/DELKEY|getDeleteKeyRecord/.test(src)) hits.push(path.relative(root, p));
        }
      }
    };
    walk(root);
    // 投稿 API（書く側）・削除 API（読む側）・専用モジュールの 3 つだけ
    expect(hits.sort()).toEqual(
      [
        path.join("app", "api", "catch-report-ugc", "route.ts"),
        path.join("app", "api", "catch-report-ugc", "[id]", "route.ts"),
        path.join("lib", "ugc-delete-key.ts"),
      ].sort(),
    );
  });
});

describe("DELETE /api/catch-report-ugc/[id]（X-Delete-Key）", () => {
  it("正しいキーで消える（スポット別一覧・最近の釣果・正本・タイムライン・写真・キャッシュ）", async () => {
    const { data } = await post();
    const res = await del(data.id, { "X-Delete-Key": data.deleteKey });
    expect(res.status).toBe(200);

    const spot = (mem.db.get("SPOT#test-spot\u0000UGC_REPORTS")?.data as { id: string }[]) ?? [];
    expect(spot.some((r) => r.id === data.id)).toBe(false);
    expect((mem.lists.get("recent_reports:global") ?? []).some((s) => s.includes(data.id))).toBe(false);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(false);
    expect(mem.db.has(`POST#${data.id}\u0000DELKEY`)).toBe(false);
    expect(deleteFromS3).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/spots/test-spot");

    const single = await getPost(new NextRequest(`http://localhost/api/posts/${data.id}`), {
      params: Promise.resolve({ id: data.id }),
    });
    expect(single.status).toBe(404);
    const timelineText = await (await getTimeline(new NextRequest("http://localhost/api/timeline"))).text();
    expect(timelineText).not.toContain(data.id);

    // 2 回目は見つからない
    expect((await del(data.id, { "X-Delete-Key": data.deleteKey })).status).toBe(404);
  });

  it("場所なし投稿もキーで消せる（spotSlug 不要）", async () => {
    const { data } = await post({ spotSlug: "" });
    expect(data.deleteKey).toMatch(DELETE_KEY_RE);
    const res = await del(data.id, { "X-Delete-Key": data.deleteKey });
    expect(res.status).toBe(200);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(false);
  });

  it("違うキー・形式不正は消さない", async () => {
    const { data } = await post();
    const other = await post();
    expect((await del(data.id, { "X-Delete-Key": other.data.deleteKey })).status).toBe(403);
    expect((await del(data.id, { "X-Delete-Key": "short" })).status).toBe(400);
    expect((await del(data.id, { "X-Delete-Key": "" })).status).toBe(400);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(true);
  });

  it("ログイン済み投稿は削除キーでは消せない（キー記録も無い）", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t1", nickname: "釣り人" } } as never);
    const { data } = await post();
    vi.mocked(auth).mockResolvedValue(null as never);
    const fakeKey = "A".repeat(43);
    expect((await del(data.id, { "X-Delete-Key": fakeKey })).status).toBe(404);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(true);
  });

  it("META に tsuriId がある投稿は、キー記録があっても消さない", async () => {
    const { data } = await post();
    const meta = mem.db.get(`POST#${data.id}\u0000META`)!;
    (meta.data as { tsuriId?: string }).tsuriId = "t9";
    expect((await del(data.id, { "X-Delete-Key": data.deleteKey })).status).toBe(403);
    expect(mem.db.has(`POST#${data.id}\u0000DELKEY`)).toBe(true);
  });

  it("レート制限を超えたら 429", async () => {
    const { data } = await post();
    vi.mocked(checkRateLimit).mockResolvedValue(false);
    expect((await del(data.id, { "X-Delete-Key": data.deleteKey })).status).toBe(429);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(true);
  });

  it("ヘッダ無しの匿名 DELETE は従来どおり 401", async () => {
    const { data } = await post();
    expect((await del(data.id, {}, "?spotSlug=test-spot")).status).toBe(401);
  });
});

describe("DELETE /api/catch-report-ugc/[id]（ログイン済み・spotSlug 省略/場所なし）", () => {
  const me = { user: { tsuriId: "t1", nickname: "釣り人" } };
  const userList = () => mem.lists.get("auth:user_reports:t1") ?? [];

  it("場所なし投稿を spotSlug 無しで消せる（正本・本人の一覧・件数）", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post({ spotSlug: "" });
    expect(data.deleteKey).toBeUndefined();
    expect(userList().some((s) => s.includes(data.id))).toBe(true);
    vi.mocked(decrementReportCount).mockClear();

    const res = await del(data.id);
    expect(res.status).toBe(200);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(false);
    expect(userList().some((s) => s.includes(data.id))).toBe(false);
    expect(decrementReportCount).toHaveBeenCalledWith("t1");
    const timelineText = await (await getTimeline(new NextRequest("http://localhost/api/timeline"))).text();
    expect(timelineText).not.toContain(data.id);
  });

  it("spotSlug= の空指定も省略と同じに扱う", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post({ spotSlug: "" });
    expect((await del(data.id, {}, "?spotSlug=")).status).toBe(200);
  });

  it("正本が無い場所なし投稿も本人の一覧から見つけて消す", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post({ spotSlug: "" });
    mem.db.delete(`POST#${data.id}\u0000META`);
    expect((await del(data.id)).status).toBe(200);
    expect(userList().some((s) => s.includes(data.id))).toBe(false);
  });

  it("場所あり投稿を spotSlug 無しで消しても、スポット別一覧から消える", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post();
    expect((await del(data.id)).status).toBe(200);
    const spot = (mem.db.get("SPOT#test-spot\u0000UGC_REPORTS")?.data as { id: string }[]) ?? [];
    expect(spot.some((r) => r.id === data.id)).toBe(false);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(false);
  });

  it("他人の場所なし投稿は 403、無い投稿は 404、不正な spotSlug は 400", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post({ spotSlug: "" });
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t2", nickname: "別人" } } as never);
    expect((await del(data.id)).status).toBe(403);
    expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(true);
    expect((await del("ugc-0-none")).status).toBe(404);
    expect((await del(data.id, {}, "?spotSlug=../x")).status).toBe(400);
  });

  it("従来どおり spotSlug 付きでも消せる", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const { data } = await post();
    expect((await del(data.id, {}, "?spotSlug=test-spot")).status).toBe(200);
  });

  it("場所あり投稿の削除後はスポットページを無効化する（spotSlug 指定・保存値から解決の両方）", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const a = await post();
    const b = await post();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(purgeCloudflareUrls).mockClear();
    expect((await del(a.data.id, {}, "?spotSlug=test-spot")).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/spots/test-spot");
    expect(purgeCloudflareUrls).toHaveBeenCalledWith(["/spots/test-spot"]);

    vi.mocked(revalidatePath).mockClear();
    vi.mocked(purgeCloudflareUrls).mockClear();
    expect((await del(b.data.id)).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/spots/test-spot");
    expect(purgeCloudflareUrls).toHaveBeenCalledWith(["/spots/test-spot"]);
  });

  it("場所なし投稿・権限なしの削除ではスポットページを無効化しない", async () => {
    vi.mocked(auth).mockResolvedValue(me as never);
    const placeless = await post({ spotSlug: "" });
    const spotPost = await post();
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(purgeCloudflareUrls).mockClear();
    expect((await del(placeless.data.id)).status).toBe(200);
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t2", nickname: "別人" } } as never);
    expect((await del(spotPost.data.id, {}, "?spotSlug=test-spot")).status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(purgeCloudflareUrls).not.toHaveBeenCalled();
  });

  it("アプリのトークン（Bearer）で場所なし投稿を消せる", async () => {
    const saved = process.env.APP_LINK_ENABLED;
    process.env.APP_LINK_ENABLED = "true";
    try {
      vi.mocked(auth).mockResolvedValue(me as never);
      const { data } = await post({ spotSlug: "" });
      vi.mocked(auth).mockResolvedValue(null as never);
      vi.mocked(verifyAppToken).mockResolvedValue({ tsuriId: "t1" } as never);
      vi.mocked(getUserStatus).mockResolvedValue("active" as never);
      vi.mocked(getUserById).mockResolvedValue({ id: "t1", nickname: "釣り人" } as never);
      const res = await del(data.id, { Authorization: `Bearer tsa_${"a".repeat(43)}` });
      expect(res.status).toBe(200);
      expect(mem.db.has(`POST#${data.id}\u0000META`)).toBe(false);
    } finally {
      if (saved === undefined) delete process.env.APP_LINK_ENABLED;
      else process.env.APP_LINK_ENABLED = saved;
    }
  });

  it("削除キーは ?spotSlug が付いていても使え、場所なし投稿も消せる", async () => {
    const { data } = await post();
    expect((await del(data.id, { "X-Delete-Key": data.deleteKey }, "?spotSlug=test-spot")).status).toBe(200);
  });
});

describe("verifyDeleteKey", () => {
  it("一致・不一致・不正値", () => {
    const key = "b".repeat(43);
    expect(verifyDeleteKey(key, hashDeleteKey(key))).toBe(true);
    expect(verifyDeleteKey("c".repeat(43), hashDeleteKey(key))).toBe(false);
    expect(verifyDeleteKey(key, "nothex")).toBe(false);
    expect(verifyDeleteKey(undefined, hashDeleteKey(key))).toBe(false);
    expect(verifyDeleteKey(key, undefined)).toBe(false);
  });
});

describe("釣果写真の持ち主確認（他人の写真・放置写真の流用防止）", () => {
  const otherPhoto = "https://tsurispot-images.s3.ap-northeast-1.amazonaws.com/catch-reports/b.jpg";

  it("アップロード記録の無い写真は付けられない", async () => {
    const { res } = await post({ photoUrl: otherPhoto });
    expect(res.status).toBe(400);
  });

  it("別の人（別IP）がアップした写真は付けられない", async () => {
    mem.kv.set("uploadowner:catch-reports/b.jpg", `ip:${sha256("9.9.9.9").slice(0, 32)}`);
    const { res } = await post({ photoUrl: otherPhoto });
    expect(res.status).toBe(400);
  });

  it("自分がアップした写真・写真なしの投稿は通る", async () => {
    expect((await post()).res.status).toBe(200);
    expect((await post({ photoUrl: undefined })).res.status).toBe(200);
  });
});
