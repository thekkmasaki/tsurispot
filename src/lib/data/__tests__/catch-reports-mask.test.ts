import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * 回帰テスト: getCatchReportsBySpotAsync は、運営返信の取得やマスク処理が失敗しても
 * 非公開プロフィールの投稿者名・tsuriId を外に出さない（fail-closed）。
 */
const m = vi.hoisted(() => ({
  reports: [] as unknown[],
  replies: vi.fn(),
  visibility: vi.fn(),
}));

vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(async (_pk: string, sk: string) => (sk === "UGC_REPORTS" ? m.reports : null)),
  dbBatchGet: vi.fn(async (keys: unknown[]) => keys.map(() => null)),
}));
vi.mock("@/lib/social-store", () => ({ getOfficialRepliesBatch: m.replies }));
vi.mock("@/lib/private-author-lookup", () => ({ getUserVisibilityCached: m.visibility }));

import { getCatchReportsBySpotAsync, type CatchReport } from "@/lib/data/catch-reports";
import { PRIVATE_AUTHOR_NAME } from "@/lib/private-author";

const SPOT = "mask-test-spot";
const base = { spotSlug: SPOT, spotName: "テスト漁港", fishName: "アジ", approved: true };

beforeEach(() => {
  m.reports = [
    { ...base, id: "r-private", userName: "ヒミツ太郎", tsuriId: "u-private", date: "2026-11-10" },
    { ...base, id: "r-public", userName: "コウカイ花子", tsuriId: "u-public", date: "2026-11-11" },
    { ...base, id: "r-anon", userName: "名無しさん", date: "2026-11-12" },
  ];
  m.replies.mockReset();
  m.visibility.mockReset();
  m.visibility.mockImplementation(async (id: string) => ({ isPublic: id !== "u-private" }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const ugc = (list: CatchReport[]) => list.filter((r) => r.id.startsWith("r-"));

describe("getCatchReportsBySpotAsync の非公開投稿者マスク", () => {
  it("運営返信の取得が例外でも、非公開プロフィールの名前と tsuriId を出さない", async () => {
    m.replies.mockRejectedValue(new Error("DynamoDB down"));
    const result = ugc(await getCatchReportsBySpotAsync(SPOT));
    const text = JSON.stringify(result);

    expect(result).toHaveLength(3);
    expect(text).not.toContain("ヒミツ太郎");
    expect(text).not.toContain("u-private");
    const priv = result.find((r) => r.id === "r-private")!;
    expect(priv.userName).toBe(PRIVATE_AUTHOR_NAME);
    expect(priv.tsuriId).toBeUndefined();
    // 公開・匿名の投稿はそのまま
    expect(text).toContain("コウカイ花子");
    expect(text).toContain("名無しさん");
  });

  it("運営返信が取れたときは返信を付けたうえでマスクする", async () => {
    m.replies.mockImplementation(async (ids: string[]) =>
      ids.map((id) => (id === "r-private" ? { text: "ありがとうございます", repliedAt: "2026-11-13" } : null)),
    );
    const result = ugc(await getCatchReportsBySpotAsync(SPOT));
    const priv = result.find((r) => r.id === "r-private")!;
    expect(priv.userName).toBe(PRIVATE_AUTHOR_NAME);
    expect(priv.officialReply?.text).toBe("ありがとうございます");
  });

  it("マスク処理そのものが失敗したら、ログイン投稿者を全員伏せる（fail-closed）", async () => {
    m.replies.mockResolvedValue([null, null, null]);
    vi.doMock("@/lib/private-author-lookup", () => {
      throw new Error("module load failed");
    });
    vi.resetModules();
    const { getCatchReportsBySpotAsync: fresh } = await import("@/lib/data/catch-reports");
    const result = ugc(await fresh(SPOT));
    vi.doUnmock("@/lib/private-author-lookup");
    const text = JSON.stringify(result);

    expect(result).toHaveLength(3);
    expect(text).not.toContain("ヒミツ太郎");
    expect(text).not.toContain("コウカイ花子");
    expect(text).not.toContain("u-private");
    expect(text).not.toContain("u-public");
    // tsuriId のない匿名投稿は伏せる対象外
    expect(text).toContain("名無しさん");
  });
});
