import { describe, it, expect } from "vitest";
import { generateSpotIntro, generateImprovedFAQs, generateSpotTips } from "../spot-content-generator";
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
});
