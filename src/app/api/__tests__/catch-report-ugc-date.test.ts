import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 外部I/Oは全てモック（日付バリデーションの検証に集中する）
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/cloudflare", () => ({ purgeCloudflareUrls: vi.fn() }));
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn().mockResolvedValue([]),
  dbPut: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({
  redis: { lpush: vi.fn(), ltrim: vi.fn() },
}));
vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/user-store", () => ({ incrementReportCount: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { POST } from "../catch-report-ugc/route";

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
