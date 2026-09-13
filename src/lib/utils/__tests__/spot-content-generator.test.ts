import { describe, it, expect } from "vitest";
import { generateSpotIntro, generateImprovedFAQs, generateSpotTips, buildSeasonTable } from "../spot-content-generator";
import { fishingSpots } from "../../data/spots";

describe("spot-content-generator", () => {
  const sampleSpot = fishingSpots[0];

  it("generateSpotIntro: 非空文字列を返す", () => {
    const intro = generateSpotIntro(sampleSpot);
    expect(intro).toBeTruthy();
    expect(typeof intro).toBe("string");
    expect(intro.length).toBeGreaterThan(10);
  });

  it("generateSpotIntro: 決定的出力（同じ入力で同じ結果）", () => {
    const intro1 = generateSpotIntro(sampleSpot);
    const intro2 = generateSpotIntro(sampleSpot);
    expect(intro1).toBe(intro2);
  });

  it("generateImprovedFAQs: 最大6問、question/answer非空", () => {
    const faqs = generateImprovedFAQs(sampleSpot);
    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs.length).toBeLessThanOrEqual(6);
    faqs.forEach((faq) => {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    });
  });

  it("generateSpotTips: 3-5個返す", () => {
    const tips = generateSpotTips(sampleSpot);
    expect(tips.length).toBeGreaterThanOrEqual(3);
    expect(tips.length).toBeLessThanOrEqual(5);
    tips.forEach((tip) => {
      expect(tip).toBeTruthy();
    });
  });

  describe("buildSeasonTable", () => {
    it("春夏秋冬の4行を必ず返す（順序も固定）", () => {
      const table = buildSeasonTable(sampleSpot);
      expect(table.map((r) => r.seasonSlug)).toEqual(["spring", "summer", "autumn", "winter"]);
    });

    it("各行に季節ラベルとアドバイスがあり、魚ゼロ季節は isOffSeason=true", () => {
      for (const row of buildSeasonTable(sampleSpot)) {
        expect(row.label).toBeTruthy();
        expect(row.advice).toBeTruthy();
        expect(row.isOffSeason).toBe(row.fish.length === 0);
      }
    });

    it("魚は同一季節で重複しない（slug一意）", () => {
      for (const row of buildSeasonTable(sampleSpot)) {
        const slugs = row.fish.map((f) => f.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    });

    it("決定的（2回呼んで同一）", () => {
      const a = buildSeasonTable(sampleSpot);
      const b = buildSeasonTable(sampleSpot);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });

    it("実在の多魚種スポットで少なくとも1季節に魚が入る", () => {
      const richSpot = fishingSpots.find((s) => s.catchableFish.length >= 5) ?? sampleSpot;
      const table = buildSeasonTable(richSpot);
      expect(table.some((r) => r.fish.length > 0)).toBe(true);
    });
  });
});
