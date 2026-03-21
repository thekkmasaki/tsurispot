import { describe, it, expect } from "vitest";
import { calcSpotBouzuProbability, getMonthCorrection, getAreaPressure } from "../bouzu-calculator";

describe("bouzu-calculator", () => {
  const baseProps = {
    spotType: "port",
    difficulty: "beginner",
    rating: 3.5,
    reviewCount: 50,
    prefecture: "兵庫県",
    areaName: "明石",
    isFree: true,
    hasRentalRod: false,
    catchableFishCount: 5,
    catchableFishDetails: [
      { fishSlug: "aji", fishName: "アジ", method: "サビキ釣り", catchDifficulty: "easy" as const, monthStart: 5, monthEnd: 11, peakSeason: true },
      { fishSlug: "iwashi", fishName: "イワシ", method: "サビキ釣り", catchDifficulty: "easy" as const, monthStart: 4, monthEnd: 10, peakSeason: false },
    ],
  };

  it("結果が5-95の範囲内", () => {
    for (let m = 1; m <= 12; m++) {
      const result = calcSpotBouzuProbability(baseProps, m);
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThanOrEqual(95);
    }
  });

  it("海の冬(1月)は月補正が+50", () => {
    expect(getMonthCorrection(1)).toBe(50);
  });

  it("河川の冬(1月)は月補正が+25", () => {
    expect(getMonthCorrection(1, "river")).toBe(25);
  });

  it("夏 < 冬（同スポットで比較）", () => {
    const summer = calcSpotBouzuProbability(baseProps, 7);
    const winter = calcSpotBouzuProbability(baseProps, 1);
    expect(summer).toBeLessThan(winter);
  });

  it("サビキは低補正（釣れやすい）", () => {
    const sabikiProps = {
      ...baseProps,
      catchableFishDetails: [
        { fishSlug: "aji", fishName: "アジ", method: "サビキ釣り", catchDifficulty: "easy" as const, monthStart: 5, monthEnd: 11, peakSeason: true },
      ],
    };
    const jiggingProps = {
      ...baseProps,
      catchableFishDetails: [
        { fishSlug: "buri", fishName: "ブリ", method: "ショアジギング", catchDifficulty: "hard" as const, monthStart: 5, monthEnd: 11, peakSeason: true },
      ],
    };
    const sabiki = calcSpotBouzuProbability(sabikiProps, 7);
    const jigging = calcSpotBouzuProbability(jiggingProps, 7);
    expect(sabiki).toBeLessThan(jigging);
  });

  it("東京湾=+18の釣り圧", () => {
    expect(getAreaPressure("東京都", "東京湾")).toBe(18);
  });

  it("能登島=-6の釣り圧", () => {
    expect(getAreaPressure("石川県", "能登島")).toBe(-6);
  });
});
