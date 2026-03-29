import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTitle, getNextTier } from "../titles";

// Redis モック
const mockStore = new Map<string, unknown>();

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(async (key: string) => mockStore.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      mockStore.set(key, value);
    }),
  },
}));

// モック後にimport（動的import）
const { incrementReportCount, decrementReportCount, getUserById, createUser } =
  await import("../auth-redis");

function seedUser(id: string, reportCount: number) {
  mockStore.set(`auth:user:${id}`, {
    id,
    nickname: "テストユーザー",
    provider: "line",
    providerId: "U_test",
    createdAt: new Date().toISOString(),
    reportCount,
  });
}

describe("投稿→称号変化 統合テスト", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("0件 → 1件投稿で「新人釣り師」→「釣りデビュー」に変わる", async () => {
    seedUser("u1", 0);
    expect(getTitle(0).label).toBe("新人釣り師");

    const newCount = await incrementReportCount("u1");
    expect(newCount).toBe(1);
    expect(getTitle(newCount).label).toBe("釣りデビュー");
  });

  it("2件 → 3件投稿で「釣りデビュー」→「見習い釣り師」に変わる", async () => {
    seedUser("u2", 2);
    expect(getTitle(2).label).toBe("釣りデビュー");

    const newCount = await incrementReportCount("u2");
    expect(newCount).toBe(3);
    expect(getTitle(newCount).label).toBe("見習い釣り師");
  });

  it("4件 → 5件投稿で「見習い釣り師」→「一人前」に変わる", async () => {
    seedUser("u3", 4);
    expect(getTitle(4).label).toBe("見習い釣り師");

    const newCount = await incrementReportCount("u3");
    expect(newCount).toBe(5);
    expect(getTitle(newCount).label).toBe("一人前");
  });

  it("9件 → 10件投稿で「一人前」→「ベテラン」に変わる", async () => {
    seedUser("u4", 9);
    expect(getTitle(9).label).toBe("一人前");

    const newCount = await incrementReportCount("u4");
    expect(newCount).toBe(10);
    expect(getTitle(newCount).label).toBe("ベテラン");
  });

  it("19件 → 20件投稿で「ベテラン」→「マスター」に変わる", async () => {
    seedUser("u5", 19);
    expect(getTitle(19).label).toBe("ベテラン");

    const newCount = await incrementReportCount("u5");
    expect(newCount).toBe(20);
    expect(getTitle(newCount).label).toBe("マスター");
  });

  it("29件 → 30件投稿で「マスター」→「凄腕アングラー」に変わる", async () => {
    seedUser("u6", 29);
    expect(getTitle(29).label).toBe("マスター");

    const newCount = await incrementReportCount("u6");
    expect(newCount).toBe(30);
    expect(getTitle(newCount).label).toBe("凄腕アングラー");
  });

  it("49件 → 50件投稿で「凄腕アングラー」→「釣りの達人」に変わる", async () => {
    seedUser("u7", 49);
    expect(getTitle(49).label).toBe("凄腕アングラー");

    const newCount = await incrementReportCount("u7");
    expect(newCount).toBe(50);
    expect(getTitle(newCount).label).toBe("釣りの達人");
  });

  it("99件 → 100件投稿で「釣りの達人」→「伝説の釣り師」に変わる", async () => {
    seedUser("u8", 99);
    expect(getTitle(99).label).toBe("釣りの達人");

    const newCount = await incrementReportCount("u8");
    expect(newCount).toBe(100);
    expect(getTitle(newCount).label).toBe("伝説の釣り師");
  });

  it("199件 → 200件投稿で「伝説の釣り師」→「釣神」に変わる", async () => {
    seedUser("u9", 199);
    expect(getTitle(199).label).toBe("伝説の釣り師");

    const newCount = await incrementReportCount("u9");
    expect(newCount).toBe(200);
    expect(getTitle(newCount).label).toBe("釣神");
  });

  it("連続投稿で称号が段階的に上がる（0→5件）", async () => {
    seedUser("u10", 0);
    const expected = [
      { count: 1, label: "釣りデビュー" },
      { count: 2, label: "釣りデビュー" },
      { count: 3, label: "見習い釣り師" },
      { count: 4, label: "見習い釣り師" },
      { count: 5, label: "一人前" },
    ];

    for (const { count, label } of expected) {
      const newCount = await incrementReportCount("u10");
      expect(newCount).toBe(count);
      expect(getTitle(newCount).label).toBe(label);
    }
  });

  it("投稿削除で称号がダウングレードする", async () => {
    seedUser("u11", 10);
    expect(getTitle(10).label).toBe("ベテラン");

    const newCount = await decrementReportCount("u11");
    expect(newCount).toBe(9);
    expect(getTitle(newCount).label).toBe("一人前");
  });

  it("投稿削除しても0未満にはならない", async () => {
    seedUser("u12", 0);
    const newCount = await decrementReportCount("u12");
    expect(newCount).toBe(0);
    expect(getTitle(newCount).label).toBe("新人釣り師");
  });

  it("存在しないユーザーのincrementは0を返す", async () => {
    const count = await incrementReportCount("nonexistent");
    expect(count).toBe(0);
  });

  it("Redisのユーザーデータが正しく更新される", async () => {
    seedUser("u13", 4);

    await incrementReportCount("u13");
    const user = await getUserById("u13");
    expect(user?.reportCount).toBe(5);

    await decrementReportCount("u13");
    const user2 = await getUserById("u13");
    expect(user2?.reportCount).toBe(4);
  });

  it("次ランク情報が投稿後に更新される", async () => {
    seedUser("u14", 0);

    // 0件: 次は釣りデビュー、あと1件
    let next = getNextTier(0);
    expect(next?.label).toBe("釣りデビュー");
    expect(next?.remaining).toBe(1);

    // 1件投稿: 次は見習い釣り師、あと2件
    const count1 = await incrementReportCount("u14");
    next = getNextTier(count1);
    expect(next?.label).toBe("見習い釣り師");
    expect(next?.remaining).toBe(2);

    // もう2件投稿: 次は一人前、あと2件
    await incrementReportCount("u14");
    const count3 = await incrementReportCount("u14");
    next = getNextTier(count3);
    expect(next?.label).toBe("一人前");
    expect(next?.remaining).toBe(2);
  });

  it("最高ランク到達後は次ランクがnull", async () => {
    seedUser("u15", 199);
    const count = await incrementReportCount("u15");
    expect(count).toBe(200);
    expect(getTitle(count).label).toBe("釣神");
    expect(getNextTier(count)).toBeNull();
  });
});
