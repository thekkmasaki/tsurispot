import { describe, it, expect } from "vitest";
import { getTitle, getNextTier, ALL_TIERS } from "../titles";

describe("getTitle", () => {
  it("0件 → 新人釣り師", () => {
    const t = getTitle(0);
    expect(t.label).toBe("新人釣り師");
    expect(t.emoji).toBe("🎒");
  });

  it("1件 → 釣りデビュー", () => {
    const t = getTitle(1);
    expect(t.label).toBe("釣りデビュー");
    expect(t.emoji).toBe("🔰");
  });

  it("3件 → 見習い釣り師", () => {
    const t = getTitle(3);
    expect(t.label).toBe("見習い釣り師");
  });

  it("5件 → 一人前", () => {
    const t = getTitle(5);
    expect(t.label).toBe("一人前");
  });

  it("10件 → ベテラン", () => {
    const t = getTitle(10);
    expect(t.label).toBe("ベテラン");
  });

  it("20件 → マスター", () => {
    const t = getTitle(20);
    expect(t.label).toBe("マスター");
  });

  it("30件 → 凄腕アングラー", () => {
    const t = getTitle(30);
    expect(t.label).toBe("凄腕アングラー");
  });

  it("50件 → 釣りの達人", () => {
    const t = getTitle(50);
    expect(t.label).toBe("釣りの達人");
  });

  it("100件 → 伝説の釣り師", () => {
    const t = getTitle(100);
    expect(t.label).toBe("伝説の釣り師");
  });

  it("200件 → 釣神", () => {
    const t = getTitle(200);
    expect(t.label).toBe("釣神");
    expect(t.emoji).toBe("🌟");
  });

  it("999件 → 釣神（最高ランクのまま）", () => {
    const t = getTitle(999);
    expect(t.label).toBe("釣神");
  });

  it("境界値: 2件 → 釣りデビュー（3件未満）", () => {
    expect(getTitle(2).label).toBe("釣りデビュー");
  });

  it("境界値: 4件 → 見習い釣り師（5件未満）", () => {
    expect(getTitle(4).label).toBe("見習い釣り師");
  });

  it("境界値: 9件 → 一人前（10件未満）", () => {
    expect(getTitle(9).label).toBe("一人前");
  });

  it("境界値: 19件 → ベテラン（20件未満）", () => {
    expect(getTitle(19).label).toBe("ベテラン");
  });

  it("境界値: 29件 → マスター（30件未満）", () => {
    expect(getTitle(29).label).toBe("マスター");
  });

  it("境界値: 49件 → 凄腕アングラー（50件未満）", () => {
    expect(getTitle(49).label).toBe("凄腕アングラー");
  });

  it("境界値: 99件 → 釣りの達人（100件未満）", () => {
    expect(getTitle(99).label).toBe("釣りの達人");
  });

  it("境界値: 199件 → 伝説の釣り師（200件未満）", () => {
    expect(getTitle(199).label).toBe("伝説の釣り師");
  });

  it("全称号にclassNameとheaderClassがある", () => {
    for (let i = 0; i <= 200; i += 10) {
      const t = getTitle(i);
      expect(t.className).toBeTruthy();
      expect(t.headerClass).toBeTruthy();
    }
  });
});

describe("getNextTier", () => {
  it("0件 → 次は釣りデビュー、あと1件", () => {
    const next = getNextTier(0);
    expect(next).not.toBeNull();
    expect(next!.label).toBe("釣りデビュー");
    expect(next!.remaining).toBe(1);
  });

  it("1件 → 次は見習い釣り師、あと2件", () => {
    const next = getNextTier(1);
    expect(next!.label).toBe("見習い釣り師");
    expect(next!.remaining).toBe(2);
  });

  it("3件 → 次は一人前、あと2件", () => {
    const next = getNextTier(3);
    expect(next!.label).toBe("一人前");
    expect(next!.remaining).toBe(2);
  });

  it("199件 → 次は釣神、あと1件", () => {
    const next = getNextTier(199);
    expect(next!.label).toBe("釣神");
    expect(next!.remaining).toBe(1);
  });

  it("200件 → null（最高ランク到達）", () => {
    expect(getNextTier(200)).toBeNull();
  });

  it("999件 → null（最高ランク到達）", () => {
    expect(getNextTier(999)).toBeNull();
  });
});

describe("ALL_TIERS", () => {
  it("10段階ある", () => {
    expect(ALL_TIERS).toHaveLength(10);
  });

  it("降順に並んでいる（min値）", () => {
    for (let i = 0; i < ALL_TIERS.length - 1; i++) {
      expect(ALL_TIERS[i].min).toBeGreaterThan(ALL_TIERS[i + 1].min);
    }
  });

  it("最高は200件、最低は0件", () => {
    expect(ALL_TIERS[0].min).toBe(200);
    expect(ALL_TIERS[ALL_TIERS.length - 1].min).toBe(0);
  });
});
