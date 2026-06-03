import { describe, it, expect, vi, beforeEach } from "vitest";

// DynamoDB をモック（getShopSubscription/getEffectivePlanMap が使う dbGet/dbBatchGet）。
// data/shops は実データを使い、静的 planLevel フォールバックを検証する。
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbPut: vi.fn(),
  dbBatchGet: vi.fn(),
}));

import { getEffectivePlan, getEffectivePlanMap } from "@/lib/shop-plan";
import { dbGet, dbBatchGet } from "@/lib/dynamodb";

const sub = (plan: string, status: string) => ({
  stripeSubscriptionId: "sub_x",
  plan,
  status,
  currentPeriodEnd: "2099-01-01T00:00:00.000Z",
});

describe("getEffectivePlan（課金状態を加味した実効プラン）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("active サブスクがあればそのプランを返す（静的free→pro）", async () => {
    vi.mocked(dbGet).mockResolvedValue(sub("pro", "active"));
    expect(await getEffectivePlan("sample-free")).toBe("pro");
  });

  it("past_due も有料扱い", async () => {
    vi.mocked(dbGet).mockResolvedValue(sub("basic", "past_due"));
    expect(await getEffectivePlan("sample-free")).toBe("basic");
  });

  it("canceled は静的 planLevel にフォールバック（sample-free=free）", async () => {
    vi.mocked(dbGet).mockResolvedValue(sub("pro", "canceled"));
    expect(await getEffectivePlan("sample-free")).toBe("free");
  });

  it("サブスク無しは静的 planLevel（sample-basic=basic）", async () => {
    vi.mocked(dbGet).mockResolvedValue(null);
    expect(await getEffectivePlan("sample-basic")).toBe("basic");
  });

  it("未知 slug かつサブスク無しは free", async () => {
    vi.mocked(dbGet).mockResolvedValue(null);
    expect(await getEffectivePlan("nonexistent-shop-xyz")).toBe("free");
  });

  it("DynamoDB 障害時は静的プランにフォールバック（例外を投げない）", async () => {
    vi.mocked(dbGet).mockRejectedValue(new Error("dynamo down"));
    expect(await getEffectivePlan("sample-basic")).toBe("basic");
  });
});

describe("getEffectivePlanMap（一覧用バッチ取得）", () => {
  beforeEach(() => vi.clearAllMocks());

  it("有料サブスクのある店舗のみ上書き、他は静的", async () => {
    vi.mocked(dbBatchGet).mockResolvedValue([sub("pro", "active"), null]);
    const map = await getEffectivePlanMap(["sample-free", "sample-basic"]);
    expect(map["sample-free"]).toBe("pro"); // サブスクで上書き
    expect(map["sample-basic"]).toBe("basic"); // 静的フォールバック
  });

  it("空配列なら空オブジェクト（BatchGetを呼ばない）", async () => {
    const map = await getEffectivePlanMap([]);
    expect(map).toEqual({});
    expect(dbBatchGet).not.toHaveBeenCalled();
  });

  it("BatchGet 障害時は全店舗が静的プランにフォールバック", async () => {
    vi.mocked(dbBatchGet).mockRejectedValue(new Error("batch down"));
    const map = await getEffectivePlanMap(["sample-free", "sample-basic", "sample-premium"]);
    expect(map["sample-free"]).toBe("free");
    expect(map["sample-basic"]).toBe("basic");
    expect(map["sample-premium"]).toBe("pro");
  });
});
