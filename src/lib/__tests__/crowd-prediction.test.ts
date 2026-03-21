import { describe, it, expect } from "vitest";
import { calculateCrowdScore, getDailyPredictions, getWeeklyPredictions } from "../crowd-prediction";

describe("crowd-prediction", () => {
  const baseInput = {
    dayOfWeek: 3, // 水曜
    hour: 10,
    month: 7,
    prefecture: "兵庫県",
  };

  it("スコアが0-100の範囲", () => {
    const result = calculateCrowdScore(baseInput);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("週末 > 平日", () => {
    const weekday = calculateCrowdScore({ ...baseInput, dayOfWeek: 3 });
    const weekend = calculateCrowdScore({ ...baseInput, dayOfWeek: 6 });
    expect(weekend.score).toBeGreaterThan(weekday.score);
  });

  it("冬は大幅に低下", () => {
    const summer = calculateCrowdScore({ ...baseInput, month: 7 });
    const winter = calculateCrowdScore({ ...baseInput, month: 1 });
    expect(winter.score).toBeLessThan(summer.score);
  });

  it("getDailyPredictions は24時間分の配列を返す", () => {
    const daily = getDailyPredictions({ dayOfWeek: 6, month: 7, prefecture: "東京都" });
    expect(daily).toHaveLength(24);
    daily.forEach((d) => {
      expect(d.hour).toBeGreaterThanOrEqual(0);
      expect(d.hour).toBeLessThanOrEqual(23);
      expect(d.prediction.score).toBeGreaterThanOrEqual(0);
      expect(d.prediction.score).toBeLessThanOrEqual(100);
    });
  });

  it("getWeeklyPredictions は7日分の配列を返す", () => {
    const weekly = getWeeklyPredictions({ month: 7, prefecture: "大阪府" });
    expect(weekly).toHaveLength(7);
    weekly.forEach((w) => {
      expect(w.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(w.dayOfWeek).toBeLessThanOrEqual(6);
      expect(w.dayLabel).toBeTruthy();
    });
  });
});
