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

  it("descriptionが100文字以上のスポット数をレポート", () => {
    const longDescSpots = fishingSpots.filter((s) => s.description.length >= 100);
    const ratio = longDescSpots.length / fishingSpots.length;
    console.log(`description >= 100文字: ${longDescSpots.length}/${fishingSpots.length}件 (${(ratio * 100).toFixed(1)}%)`);
    // 現状はレポートのみ（将来的に改善目標として閾値を上げる）
    expect(fishingSpots.length).toBeGreaterThan(0);
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
