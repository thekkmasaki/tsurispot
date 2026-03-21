import { describe, it, expect } from "vitest";
import { affiliateProducts, getSeasonFromMonth } from "../affiliate-products";

describe("affiliate products data", () => {
  it("affiliateProducts配列が空でない", () => {
    expect(affiliateProducts.length).toBeGreaterThan(0);
  });

  it("全商品のURLがamzn.toまたはa.r10.to形式", () => {
    affiliateProducts.forEach((p) => {
      expect(p.url).toMatch(/^https:\/\/(amzn\.to|a\.r10\.to)\//);
    });
  });

  it("全商品のidが一意", () => {
    const ids = affiliateProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("全商品の必須フィールドが非空", () => {
    affiliateProducts.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.url).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.seasons.length).toBeGreaterThan(0);
      expect(p.category).toBeTruthy();
    });
  });

  it("categoryが有効値", () => {
    const validCategories = ["tackle", "bait", "wear", "accessory", "book"];
    affiliateProducts.forEach((p) => {
      expect(validCategories).toContain(p.category);
    });
  });

  it("seasonsが有効値", () => {
    const validSeasons = ["spring", "summer", "autumn", "winter", "all"];
    affiliateProducts.forEach((p) => {
      p.seasons.forEach((s) => {
        expect(validSeasons).toContain(s);
      });
    });
  });

  it("getSeasonFromMonthが正しく季節を返す", () => {
    expect(getSeasonFromMonth(3)).toBe("spring");
    expect(getSeasonFromMonth(6)).toBe("summer");
    expect(getSeasonFromMonth(9)).toBe("autumn");
    expect(getSeasonFromMonth(12)).toBe("winter");
    expect(getSeasonFromMonth(1)).toBe("winter");
  });
});
