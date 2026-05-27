import { describe, it, expect } from "vitest";
import { fishingSpots } from "../data/spots";
import { tackleShops } from "../data/shops";

describe("SEO validation", () => {
  it("全スポットのdescriptionが非空", () => {
    fishingSpots.forEach((s) => {
      expect(s.description).toBeTruthy();
      expect(s.description.length).toBeGreaterThan(0);
    });
  });

  it("descriptionが100文字以上のスポット比率が95%以上", () => {
    const longDescSpots = fishingSpots.filter((s) => s.description.length >= 100);
    const ratio = longDescSpots.length / fishingSpots.length;
    console.log(`description >= 100文字: ${longDescSpots.length}/${fishingSpots.length}件 (${(ratio * 100).toFixed(1)}%)`);
    // spots.ts の enrichDescriptions() で <100字 を generateSpotIntro で補完するため、
    // 95%+ を満たすことを期待。sitemap.ts:251 の品質フィルタを通過する基盤。
    expect(ratio).toBeGreaterThanOrEqual(0.95);
  });

  it("スポットslugに不正文字がない", () => {
    const validSlugPattern = /^[a-z0-9-]+$/;
    fishingSpots.forEach((s) => {
      expect(s.slug).toMatch(validSlugPattern);
    });
  });

  it("釣具店slugに不正文字がない", () => {
    const validSlugPattern = /^[a-z0-9-]+$/;
    tackleShops.forEach((s) => {
      expect(s.slug).toMatch(validSlugPattern);
    });
  });

  it("釣具店のLocalBusiness必須フィールド", () => {
    tackleShops.forEach((s) => {
      expect(s.name).toBeTruthy();
      expect(s.address).toBeTruthy();
      // phoneは空文字の店舗もあるためdefinedチェック
      expect(typeof s.phone).toBe("string");
    });
  });
});
