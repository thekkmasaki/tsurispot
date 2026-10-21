import { describe, it, expect } from "vitest";
import {
  getCurrentMonthTargets,
  pickRecentUgcCatches,
  isMonthInSeason,
  getJstMonth,
  formatMonthDay,
} from "../spot-recent-catch";
import type { CatchTier } from "../data/fish-aptitude/types";

const cf = (
  slug: string,
  name: string,
  monthStart: number,
  monthEnd: number,
  peakSeason = false,
  method = "サビキ釣り",
) => ({ fish: { slug, name }, monthStart, monthEnd, peakSeason, method });

describe("isMonthInSeason", () => {
  it("通常範囲と年またぎ", () => {
    expect(isMonthInSeason(10, 6, 11)).toBe(true);
    expect(isMonthInSeason(12, 6, 11)).toBe(false);
    expect(isMonthInSeason(1, 10, 2)).toBe(true); // 10月〜2月
    expect(isMonthInSeason(5, 10, 2)).toBe(false);
  });
});

describe("getCurrentMonthTargets（今月の対象魚）", () => {
  const tiers: Record<string, CatchTier> = {
    aji: "excellent",
    sawara: "good",
    aori: "fair",
    kisu: "excellent",
    ayu: "excluded",
  };
  const tierOf = (slug: string) => tiers[slug] ?? "good";

  const fish = [
    cf("sawara", "サワラ", 9, 12, true, "ショアジギング"),
    cf("aji", "アジ", 6, 11, true),
    cf("aori", "アオリイカ", 9, 11, false, "エギング"),
    cf("kisu", "シロギス", 5, 9, true, "ちょい投げ"), // 10月は範囲外
    cf("ayu", "アユ", 6, 10, true), // 生息域外（excluded）は除外
    cf("aji", "アジ", 4, 12, false, "アジング"), // 同一魚種の重複: 旬の方を採用
  ];

  it("今月シーズン中の魚だけを釣れる度→旬→名前順で返す", () => {
    const r = getCurrentMonthTargets(fish, 10, tierOf);
    expect(r.map((f) => f.slug)).toEqual(["aji", "sawara", "aori"]);
    expect(r[0].tier).toBe("excellent");
    expect(r[0].method).toBe("サビキ釣り"); // 旬フラグありのエントリを採用
  });

  it("excluded の魚と範囲外の月は含まれない", () => {
    const r = getCurrentMonthTargets(fish, 10, tierOf);
    expect(r.find((f) => f.slug === "ayu")).toBeUndefined();
    expect(r.find((f) => f.slug === "kisu")).toBeUndefined();
  });

  it("limit で件数を絞る・該当なしは空配列", () => {
    expect(getCurrentMonthTargets(fish, 10, tierOf, 2)).toHaveLength(2);
    expect(getCurrentMonthTargets(fish, 2, tierOf)).toEqual([]);
  });
});

describe("pickRecentUgcCatches（最新UGC釣果）", () => {
  const reports = [
    { id: "cr-001", date: "2026-10-20", fishName: "アジ", userName: "サンプル", approved: true },
    { id: "ugc-1", date: "2026-10-18", fishName: "サワラ", sizeCm: 70, method: "ショアジギング", userName: "A", approved: true },
    { id: "ugc-2", date: "2026-10-19", fishName: "アジ", userName: "B", approved: true },
    { id: "ugc-3", date: "2026-10-21", fishName: "タチウオ", userName: "C", approved: false },
    { id: "ugc-4", date: "2026-09-01", fishName: "キス", userName: "D", approved: true },
  ];

  it("サンプル(cr-*)と未承認を除外し、日付降順で limit 件", () => {
    const r = pickRecentUgcCatches(reports, 2);
    expect(r.map((x) => x.id)).toEqual(["ugc-2", "ugc-1"]);
    expect(r[1].sizeCm).toBe(70);
  });

  it("UGC が無ければ空配列（ブロック側で見出しを出さない判断に使う）", () => {
    expect(pickRecentUgcCatches([reports[0]])).toEqual([]);
  });
});

describe("helpers", () => {
  it("getJstMonth は JST 基準", () => {
    // UTC 2026-10-31T16:00 = JST 2026-11-01T01:00
    expect(getJstMonth(new Date("2026-10-31T16:00:00Z"))).toBe(11);
    expect(getJstMonth(new Date("2026-10-31T14:00:00Z"))).toBe(10);
  });
  it("formatMonthDay", () => {
    expect(formatMonthDay("2026-10-08")).toBe("10/8");
    expect(formatMonthDay("不明")).toBe("不明");
  });
});
