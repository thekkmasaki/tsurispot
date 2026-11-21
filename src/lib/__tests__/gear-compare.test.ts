import { describe, expect, it } from "vitest";
import type { GearModel, RakutenItem } from "@/lib/data/gear-compare/types";
import { GEAR_COMPARE_CATEGORIES } from "@/lib/data/gear-compare/categories";
import { RAKUTEN_ITEMS } from "@/lib/data/gear-compare/rakuten-items";
import { buyLinks, filterModels, formatRange, sortModels } from "@/lib/gear-compare";
import { isAffiliateUrl } from "@/lib/blog/affiliate-rel";

const base: Omit<GearModel, "id" | "model"> = {
  maker: "M",
  series: "S",
  lengthFt: null,
  lengthM: null,
  pieces: 2,
  lureMinG: null,
  lureMaxG: null,
  peMin: null,
  peMax: null,
  weightG: null,
  priceYen: null,
  sourceUrl: "https://example.com",
};
const a: GearModel = { ...base, id: "a", model: "A", lureMinG: 15, lureMaxG: 50, priceYen: 9000, lengthM: 2.9 };
const b: GearModel = { ...base, id: "b", model: "B", lureMaxG: 100, priceYen: 14000, lengthM: 3.05 };
const c: GearModel = { ...base, id: "c", model: "C", lureMaxG: 60 };
const items: Record<string, RakutenItem> = {
  b: { itemName: "B", price: 8000, affiliateUrl: "https://hb.afl.rakuten.co.jp/x", imageUrl: null, shopName: "s", reviewAverage: 0, reviewCount: 0, fetchedAt: "2026-11-18" },
};

describe("filterModels", () => {
  it("ジグの重さが範囲内の機種だけ", () => {
    expect(filterModels([a, b, c], items, { jigG: 60 }).map((m) => m.id)).toEqual(["b", "c"]);
    expect(filterModels([a, b, c], items, { jigG: 10 }).map((m) => m.id)).toEqual(["b", "c"]);
  });
  it("予算は楽天価格を優先し、価格不明は除外", () => {
    expect(filterModels([a, b, c], items, { budgetYen: 8500 }).map((m) => m.id)).toEqual(["b"]);
  });
});

describe("sortModels", () => {
  it("価格昇順・値なしは末尾", () => {
    expect(sortModels([c, a, b], items, "price").map((m) => m.id)).toEqual(["b", "a", "c"]);
  });
  it("ルアー最大は降順", () => {
    expect(sortModels([a, c, b], items, "lureMax").map((m) => m.id)).toEqual(["b", "c", "a"]);
  });
});

describe("buyLinks / formatRange", () => {
  it("楽天は取得済み商品、未取得は検索。どちらもアフィリエイトURL", () => {
    expect(buyLinks(b, items.b).rakuten).toBe("https://hb.afl.rakuten.co.jp/x");
    const l = buyLinks(a);
    expect(isAffiliateUrl(l.rakuten)).toBe(true);
    expect(isAffiliateUrl(l.amazon)).toBe(true);
  });
  it("範囲表記", () => {
    expect(formatRange(15, 50, "g")).toBe("15〜50g");
    expect(formatRange(null, 60, "g")).toBe("MAX 60g");
    expect(formatRange(null, null, "g")).toBe("—");
  });
});

describe("比較データの整合性", () => {
  const all = GEAR_COMPARE_CATEGORIES.flatMap((cat) => cat.models);
  it("機種IDは一意で形式が正しい", () => {
    const ids = all.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });
  it("出典URLがあり、範囲の上下が逆転していない", () => {
    for (const m of all) {
      expect(m.sourceUrl).toMatch(/^https:\/\//);
      if (m.lureMinG != null && m.lureMaxG != null) expect(m.lureMinG).toBeLessThanOrEqual(m.lureMaxG);
      if (m.peMin != null && m.peMax != null) expect(m.peMin).toBeLessThanOrEqual(m.peMax);
    }
  });
  it("楽天データは存在する機種のものだけ", () => {
    const ids = new Set(all.map((m) => m.id));
    for (const k of Object.keys(RAKUTEN_ITEMS)) expect(ids.has(k)).toBe(true);
  });
});

describe("jigMaxG", () => {
  it("ジグ上限が別記の機種はそれで判定する", () => {
    const s: GearModel = { ...base, id: "s", model: "S", lureMinG: 8, lureMaxG: 42, jigMaxG: 50 };
    expect(filterModels([s], {}, { jigG: 50 }).map((m) => m.id)).toEqual(["s"]);
  });
});
