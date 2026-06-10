import { describe, it, expect } from "vitest";
import { isLowQualitySpot, isSitemapEligible, type SpotQualityInput } from "../seo-quality";

/** desc をn文字、魚種をn種持つ最小限の入力を生成 */
const spot = (descLen: number, fishCount: number): SpotQualityInput => ({
  description: "あ".repeat(descLen),
  catchableFish: Array.from({ length: fishCount }, (_, i) => ({ id: i })),
});

describe("seo-quality 品質ティア判定", () => {
  describe("isLowQualitySpot（noindex帯: desc<50 かつ 魚種<=1）", () => {
    it("desc 49字・魚種1 → noindex帯", () => {
      expect(isLowQualitySpot(spot(49, 1))).toBe(true);
    });
    it("desc 50字・魚種1 → noindex帯ではない（境界値）", () => {
      expect(isLowQualitySpot(spot(50, 1))).toBe(false);
    });
    it("desc 49字・魚種2 → noindex帯ではない（魚種が基準を満たす）", () => {
      expect(isLowQualitySpot(spot(49, 2))).toBe(false);
    });
    it("desc 0字・魚種0 → noindex帯", () => {
      expect(isLowQualitySpot(spot(0, 0))).toBe(true);
    });
  });

  describe("isSitemapEligible（sitemap帯: desc>=100 かつ 魚種>=2）", () => {
    it("desc 99字・魚種2 → sitemap非掲載（境界値）", () => {
      expect(isSitemapEligible(spot(99, 2))).toBe(false);
    });
    it("desc 100字・魚種2 → sitemap掲載（境界値）", () => {
      expect(isSitemapEligible(spot(100, 2))).toBe(true);
    });
    it("desc 100字・魚種1 → sitemap非掲載（魚種不足）", () => {
      expect(isSitemapEligible(spot(100, 1))).toBe(false);
    });
  });

  describe("3層ティアの整合性", () => {
    it("noindex帯とsitemap帯は排他（同時に両方にはならない）", () => {
      for (const descLen of [0, 49, 50, 99, 100, 200]) {
        for (const fishCount of [0, 1, 2, 5]) {
          const s = spot(descLen, fishCount);
          expect(isLowQualitySpot(s) && isSitemapEligible(s)).toBe(false);
        }
      }
    });
    it("中間帯が存在する（desc 50-99字はindex可だがsitemap非掲載）", () => {
      const s = spot(75, 3);
      expect(isLowQualitySpot(s)).toBe(false);
      expect(isSitemapEligible(s)).toBe(false);
    });
    it("desc 100字以上でも魚種1ならsitemap非掲載の中間帯", () => {
      const s = spot(150, 1);
      expect(isLowQualitySpot(s)).toBe(false);
      expect(isSitemapEligible(s)).toBe(false);
    });
  });
});
