import { describe, it, expect } from "vitest";
import {
  parseSeasonRange,
  isMonthInRange,
  normalizeFishName,
  scoreEstimatedFish,
  applyEnvironmentalEstimation,
  getMonthlyTopFish,
  type EstimationContext,
} from "../fish-estimation";
import type { EstimatedFish, SpotAnalysisResult } from "../types";

const baseFish: EstimatedFish = {
  name: "アジ",
  method: "サビキ釣り",
  season: "5月〜11月",
  difficulty: "easy",
  probability: 0.8,
};

function makeCtx(overrides: Partial<EstimationContext> = {}): EstimationContext {
  return {
    now: new Date("2026-06-15T09:00:00+09:00"),
    latitude: 34.63,
    longitude: 135.07,
    catchableFish: [],
    ...overrides,
  };
}

describe("parseSeasonRange / isMonthInRange", () => {
  it("通常範囲をパースする", () => {
    expect(parseSeasonRange("5月〜11月")).toEqual({ start: 5, end: 11 });
  });

  it("通年は null", () => {
    expect(parseSeasonRange("通年")).toBeNull();
  });

  it("年跨ぎ範囲（11月〜4月）を正しく判定する", () => {
    expect(isMonthInRange(12, 11, 4)).toBe(true);
    expect(isMonthInRange(2, 11, 4)).toBe(true);
    expect(isMonthInRange(7, 11, 4)).toBe(false);
  });
});

describe("normalizeFishName — 表記ゆれ正規化", () => {
  it("地方名を正式名称に変換する", () => {
    expect(normalizeFishName("チヌ")).toBe("クロダイ");
    expect(normalizeFishName("スズキ")).toBe("シーバス");
    expect(normalizeFishName("ソイ")).toBe("クロソイ");
    expect(normalizeFishName("アコウ")).toBe("キジハタ");
  });

  it("正式名称はそのまま", () => {
    expect(normalizeFishName("アジ")).toBe("アジ");
  });
});

describe("scoreEstimatedFish — 環境パラメータ", () => {
  it("シーズン内はシーズン外より高スコア", () => {
    const inSeason = scoreEstimatedFish(baseFish, makeCtx()); // 6月
    const offSeason = scoreEstimatedFish(
      baseFish,
      makeCtx({ now: new Date("2026-02-15T09:00:00+09:00") })
    );
    expect(inSeason.inSeasonNow).toBe(true);
    expect(offSeason.inSeasonNow).toBe(false);
    expect(inSeason.adjustedProbability).toBeGreaterThan(
      offSeason.adjustedProbability
    );
  });

  it("スポット実データに存在する魚はブーストされる", () => {
    const without = scoreEstimatedFish(baseFish, makeCtx());
    const withMatch = scoreEstimatedFish(
      baseFish,
      makeCtx({
        catchableFish: [
          { name: "アジ", monthStart: 5, monthEnd: 11, peakSeason: true },
        ],
      })
    );
    expect(withMatch.adjustedProbability).toBeGreaterThan(
      without.adjustedProbability
    );
  });

  it("表記ゆれ越しでも実データと照合できる（スズキ↔シーバス）", () => {
    const suzuki: EstimatedFish = { ...baseFish, name: "スズキ", season: "通年" };
    const matched = scoreEstimatedFish(
      suzuki,
      makeCtx({
        catchableFish: [{ name: "シーバス", monthStart: 1, monthEnd: 12 }],
      })
    );
    const unmatched = scoreEstimatedFish(suzuki, makeCtx());
    expect(matched.adjustedProbability).toBeGreaterThan(
      unmatched.adjustedProbability
    );
  });

  it("釣果報告ブーストは上限0.15で頭打ち", () => {
    const few = scoreEstimatedFish(
      baseFish,
      makeCtx({ catchCounts: { アジ: 2 } })
    );
    const many = scoreEstimatedFish(
      baseFish,
      makeCtx({ catchCounts: { アジ: 100 } })
    );
    expect(few.catchReportCount).toBe(2);
    expect(many.catchReportCount).toBe(100);
    expect(many.adjustedProbability - few.adjustedProbability).toBeLessThanOrEqual(
      0.15
    );
  });

  it("潮汐係数は回遊魚のみに作用する（根魚は月齢で不変）", () => {
    const rockfish: EstimatedFish = {
      name: "カサゴ",
      method: "穴釣り",
      season: "通年",
      difficulty: "easy",
      probability: 0.7,
    };
    // 月齢が異なる2日付（潮回りが変わる）
    const d1 = makeCtx({ now: new Date("2026-06-15T09:00:00+09:00") });
    const d2 = makeCtx({ now: new Date("2026-06-22T09:00:00+09:00") });
    expect(scoreEstimatedFish(rockfish, d1).adjustedProbability).toBe(
      scoreEstimatedFish(rockfish, d2).adjustedProbability
    );
  });

  it("スコアは0.05〜0.98にクランプされる", () => {
    const weak: EstimatedFish = { ...baseFish, probability: 0.05, season: "1月〜2月" };
    const strong: EstimatedFish = { ...baseFish, probability: 0.98 };
    const weakScore = scoreEstimatedFish(weak, makeCtx());
    const strongScore = scoreEstimatedFish(
      strong,
      makeCtx({
        catchableFish: [
          { name: "アジ", monthStart: 5, monthEnd: 11, peakSeason: true },
        ],
        catchCounts: { アジ: 10 },
      })
    );
    expect(weakScore.adjustedProbability).toBeGreaterThanOrEqual(0.05);
    expect(strongScore.adjustedProbability).toBeLessThanOrEqual(0.98);
  });

  it("決定論的（同一入力で同一出力）", () => {
    const a = scoreEstimatedFish(baseFish, makeCtx());
    const b = scoreEstimatedFish(baseFish, makeCtx());
    expect(a).toEqual(b);
  });
});

describe("applyEnvironmentalEstimation / getMonthlyTopFish", () => {
  const analysis = {
    zones: [
      {
        id: "zone-0",
        name: "西端エリア",
        xRange: [0, 0.5] as [number, number],
        structures: [],
        seaBottomFeatures: [],
        estimatedDepth: { shore: 3, offshore: 5 },
        currentFlow: 0.8,
        estimatedFish: [
          { ...baseFish, probability: 0.5 },
          {
            name: "メバル",
            method: "メバリング",
            season: "11月〜4月",
            difficulty: "medium" as const,
            probability: 0.9,
          },
        ],
        rating: "good" as const,
      },
    ],
  } as unknown as SpotAnalysisResult;

  it("6月はシーズン外のメバルよりシーズン内のアジが上位になる", () => {
    const result = applyEnvironmentalEstimation(analysis, makeCtx());
    const fish = result.zones[0].estimatedFish;
    expect(fish[0].name).toBe("アジ");
  });

  it("getMonthlyTopFish は重複なしで上位を返す", () => {
    const top = getMonthlyTopFish(analysis, makeCtx(), 5);
    expect(top.length).toBe(2);
    expect(top[0].adjustedProbability).toBeGreaterThanOrEqual(
      top[1].adjustedProbability
    );
  });
});
