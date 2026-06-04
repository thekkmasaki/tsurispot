import { describe, it, expect } from "vitest";
import { PLAN_PRICING, formatYen } from "../plans";

describe("plans 価格定数（単一ソース）", () => {
  it("価格が想定値（変更時は意図確認のため検知）", () => {
    expect(PLAN_PRICING.basic.firstYear).toBe(500);
    expect(PLAN_PRICING.basic.afterYear).toBe(980);
    expect(PLAN_PRICING.pro.firstYear).toBe(1980);
    expect(PLAN_PRICING.pro.afterYear).toBe(2980);
  });

  it("初年度 < 2年目（割引構造）", () => {
    expect(PLAN_PRICING.basic.firstYear).toBeLessThan(PLAN_PRICING.basic.afterYear);
    expect(PLAN_PRICING.pro.firstYear).toBeLessThan(PLAN_PRICING.pro.afterYear);
  });

  it("formatYen はカンマ区切り", () => {
    expect(formatYen(500)).toBe("500");
    expect(formatYen(980)).toBe("980");
    expect(formatYen(1980)).toBe("1,980");
    expect(formatYen(2980)).toBe("2,980");
  });
});
