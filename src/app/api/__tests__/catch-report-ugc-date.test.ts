import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 外部I/Oは全てモック（日付バリデーションの検証に集中する）
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ purgeCloudflareUrls: vi.fn() }));
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn().mockResolvedValue([]),
  dbPut: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({
  redis: {
    lpush: vi.fn(),
    ltrim: vi.fn(),
    lrange: vi.fn().mockResolvedValue([]),
    smembers: vi.fn().mockResolvedValue([]),
    zincrby: vi.fn(),
  },
}));
vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/user-store", () => ({ incrementReportCount: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { POST } from "../catch-report-ugc/route";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { incrementReportCount } from "@/lib/user-store";
import { dbGet, dbPut } from "@/lib/dynamodb";

function postReport(date: string) {
  return POST(
    new Request("http://localhost/api/catch-report-ugc", {
      method: "POST",
      body: JSON.stringify({
        spotSlug: "test-spot",
        spotName: "テストスポット",
        fishName: "アジ",
        userName: "テスト太郎",
        comment: "サビキで釣れました",
        date,
      }),
    }),
  );
}

describe("catch-report-ugc 未来日チェック（JST基準）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // UTC 2026-07-28 20:00 = JST 2026-07-29 05:00（早朝マヅメ帯）
    // UTC基準の旧実装だと JST の「今日」が未来日扱いで 400 になっていた時間帯
    vi.setSystemTime(new Date("2026-07-28T20:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("JST早朝でも JST の今日 (UTCでは明日) の投稿を受け付ける", async () => {
    const res = await postReport("2026-07-29");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("昨日の投稿は受け付ける", async () => {
    const res = await postReport("2026-07-28");
    expect(res.status).toBe(200);
  });

  it("JST基準で未来の日付は 400", async () => {
    const res = await postReport("2026-07-30");
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("未来の日付");
  });
});

function postBody(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/catch-report-ugc", {
      method: "POST",
      body: JSON.stringify({
        spotSlug: "test-spot",
        spotName: "テストスポット",
        fishName: "アジ",
        userName: "テスト太郎",
        date: "2026-07-28",
        ...body,
      }),
    }),
  );
}

describe("catch-report-ugc ひとこと任意化", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T20:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("comment なしでも投稿を受け付ける（チップ完結の最小投稿）", async () => {
    const res = await postBody({});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("空文字の comment も受け付ける", async () => {
    const res = await postBody({ comment: "" });
    expect(res.status).toBe(200);
  });

  it("100文字超の comment は 400", async () => {
    const res = await postBody({ comment: "あ".repeat(101) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("100文字以内");
  });
});

describe("catch-report-ugc 投稿リザルト（result payload）", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T20:00:00Z"));
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(redis.lrange).mockResolvedValue([]);
    vi.mocked(redis.smembers).mockResolvedValue([]);
    vi.mocked(incrementReportCount).mockResolvedValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("匿名投稿は id と fishSlugs を返し result は含まない", async () => {
    const res = await postBody({ fishName: "アジ" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.id).toBe("string");
    expect(Array.isArray(data.fishSlugs)).toBe(true);
    expect(data.result).toBeUndefined();
  });

  it("ログイン投稿は図鑑新規種・自己ベスト初記録・件数を返す", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t1" } } as never);
    vi.mocked(incrementReportCount).mockResolvedValue(5);
    vi.mocked(redis.lrange).mockResolvedValue([
      JSON.stringify({ fishName: "アジ", sizeCm: 10, date: "2026-07-01" }),
    ]);
    const res = await postBody({ fishName: "サバ", sizeCm: 20 });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(data.result.reportCount).toBe(5);
    expect(data.result.newDexSpecies).toEqual(["サバ"]);
    expect(data.result.dexCount).toBe(2);
    expect(data.result.best).toEqual({ fishName: "サバ", sizeCm: 20, prevBest: null });
  });

  it("過去ベスト未満のサイズでは best を返さず、既知の魚種は新規扱いしない", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t1" } } as never);
    vi.mocked(redis.lrange).mockResolvedValue([
      JSON.stringify({ fishName: "アジ", sizeCm: 30, date: "2026-07-01" }),
    ]);
    const res = await postBody({ fishName: "アジ", sizeCm: 20 });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.newDexSpecies).toEqual([]);
    expect(data.result.best).toBeNull();
    // incrementReportCount が 0（ユーザー不在等）のときは user_reports 由来で近似
    expect(data.result.reportCount).toBe(2);
  });

  it("複数魚種「アジ、サバ」は分割して図鑑差分を計算する", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "t1" } } as never);
    vi.mocked(redis.lrange).mockResolvedValue([
      JSON.stringify({ fishName: "アジ", date: "2026-07-01" }),
    ]);
    const res = await postBody({ fishName: "アジ、サバ" });
    const data = await res.json();
    expect(data.result.newDexSpecies).toEqual(["サバ"]);
    expect(data.result.dexCount).toBe(2);
  });
});

describe("catch-report-ugc 開拓者（スポット初投稿）判定", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T20:00:00Z"));
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(redis.lrange).mockResolvedValue([]);
    vi.mocked(redis.smembers).mockResolvedValue([]);
    vi.mocked(dbPut).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(dbGet).mockReset();
    vi.mocked(dbGet).mockResolvedValue([]);
  });

  it("既存投稿ゼロ + PIONEER未存在なら開拓者になり、永続レコードをTTLなしで保存する", async () => {
    vi.mocked(dbGet).mockImplementation(((_pk: string, sk: string) =>
      sk === "PIONEER" ? Promise.resolve(null) : Promise.resolve([])) as never);
    const res = await postBody({});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pioneer).toBe(true);
    const pioneerPut = vi.mocked(dbPut).mock.calls.find((c) => c[1] === "PIONEER");
    expect(pioneerPut).toBeDefined();
    expect(pioneerPut?.[0]).toBe("SPOT#test-spot");
    // 第4引数（TTL秒）が無い = TTLなしの永続保存
    expect(pioneerPut?.[3]).toBeUndefined();
    const record = pioneerPut?.[2] as { userName: string };
    expect(record.userName).toBe("テスト太郎");
  });

  it("既存投稿があるスポットでは開拓者にならない（遡及なし）", async () => {
    vi.mocked(dbGet).mockImplementation(((_pk: string, sk: string) =>
      sk === "PIONEER"
        ? Promise.resolve(null)
        : Promise.resolve([{ id: "ugc-1", fishName: "アジ", approved: true }])) as never);
    const res = await postBody({});
    const data = await res.json();
    expect(data.pioneer).toBe(false);
    expect(vi.mocked(dbPut).mock.calls.some((c) => c[1] === "PIONEER")).toBe(false);
  });

  it("PIONEERレコードが既にあれば再認定しない（レポートTTL切れ後の二重認定防止）", async () => {
    vi.mocked(dbGet).mockImplementation(((_pk: string, sk: string) =>
      sk === "PIONEER"
        ? Promise.resolve({ userName: "先客", date: "2025-01-01", reportId: "ugc-0", at: "" })
        : Promise.resolve([])) as never);
    const res = await postBody({});
    const data = await res.json();
    expect(data.pioneer).toBe(false);
    expect(vi.mocked(dbPut).mock.calls.some((c) => c[1] === "PIONEER")).toBe(false);
  });
});
