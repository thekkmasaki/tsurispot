import { describe, it, expect } from "vitest";
import { calcFishingIndex, fishingIndexLabel } from "@/lib/weather/fishing-index";
import type { DayWeatherDigest } from "@/lib/weather/open-meteo";
import type { HourlyWeatherData, TideInfo } from "@/lib/weather/calculations";

function hourly(code = 1, windKmh = 10): HourlyWeatherData[] {
  return Array.from({ length: 24 }, () => ({
    temp: 28,
    weatherCode: code,
    windSpeed: windKmh,
    windDirection: 180,
  }));
}

function day(overrides: Partial<DayWeatherDigest> = {}): DayWeatherDigest {
  return {
    date: "2026-08-16",
    weatherCode: 1,
    tempMax: 30,
    windMaxMs: 2.5,
    sunrise: "05:00",
    sunset: "18:30",
    hourly: hourly(),
    seaTempC: 24,
    ...overrides,
  };
}

// 潮情報は呼出側（APIルート）が @/lib/tide で解決して渡す契約。
// テストでは実データ相当のフィクスチャを使う（2026-08-16 東京: 中潮・月齢3.4）。
function tide(overrides: Partial<TideInfo> = {}): TideInfo {
  return {
    moonAge: 3.4,
    tideType: "中潮",
    tideLabel: "中潮",
    fishingScore: 4,
    highTides: ["04:31", "17:56"],
    lowTides: ["11:12", "23:22"],
    description: "適度な潮の流れがあり、安定した釣果が期待できる。",
    ...overrides,
  };
}

describe("calcFishingIndex", () => {
  it("内訳の合計が必ず総合点に一致する（③の信頼性の要）", () => {
    for (const d of [
      day(),
      day({ seaTempC: null }),
      day({ weatherCode: 61, windMaxMs: 8, tempMax: 35 }),
      day({ weatherCode: 95, windMaxMs: 12, seaTempC: 30 }),
    ]) {
      const r = calcFishingIndex(tide(), d);
      const sum = r.breakdown.reduce((a, b) => a + b.value, 0);
      expect(sum).toBe(r.score);
    }
  });

  it("スコアは0-100の範囲", () => {
    const good = calcFishingIndex(tide(), day());
    const bad = calcFishingIndex(
      tide(),
      day({ weatherCode: 95, windMaxMs: 15, tempMax: 36, seaTempC: 31 }),
    );
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.score).toBeLessThanOrEqual(100);
    expect(bad.score).toBeGreaterThanOrEqual(0);
  });

  it("水温が取れないと配点プロファイルが切り替わる（天気が20点満点になる）", () => {
    const marine = calcFishingIndex(tide(), day());
    const inland = calcFishingIndex(tide(), day({ seaTempC: null }));
    expect(marine.profile).toBe("marine");
    expect(marine.breakdown).toHaveLength(5);
    expect(inland.profile).toBe("no-sea-temp");
    expect(inland.breakdown).toHaveLength(4);
    const weatherRow = inland.breakdown.find((b) => b.key === "weather")!;
    expect(weatherRow.max).toBe(20);
    // どちらのプロファイルも満点は100
    const maxSum = (r: typeof marine) =>
      r.breakdown.reduce((a, b) => a + b.max, 0);
    expect(maxSum(marine)).toBe(100);
    expect(maxSum(inland)).toBe(100);
  });

  it("潮回りのスコアが潮の配点に反映される（大潮35点・長潮7点）", () => {
    const spring = calcFishingIndex(
      tide({ tideType: "大潮", tideLabel: "大潮", fishingScore: 5 }),
      day(),
    );
    const neap = calcFishingIndex(
      tide({ tideType: "長潮", tideLabel: "長潮", fishingScore: 1 }),
      day(),
    );
    expect(spring.breakdown.find((b) => b.key === "tide")!.value).toBe(35);
    expect(neap.breakdown.find((b) => b.key === "tide")!.value).toBe(7);
  });

  it("満干時刻が空（淡水・データ未整備）でも計算が成立する", () => {
    const r = calcFishingIndex(tide({ highTides: [], lowTides: [] }), day());
    const sum = r.breakdown.reduce((a, b) => a + b.value, 0);
    expect(sum).toBe(r.score);
    expect(r.best).not.toBeNull(); // マヅメ・風だけでもベスト時間帯は出る
  });

  it("マヅメ帯の雨で減点される", () => {
    const rainMorning = hourly();
    for (let h = 4; h <= 6; h++) rainMorning[h].weatherCode = 61;
    const r = calcFishingIndex(tide(), day({ hourly: rainMorning }));
    const tw = r.breakdown.find((b) => b.key === "twilight")!;
    expect(tw.value).toBe(20);
    expect(tw.reason).toContain("朝マヅメが雨予報");
  });

  it("風は無風20点から線形減点", () => {
    const calm = calcFishingIndex(tide(), day({ windMaxMs: 0 }));
    const windy = calcFishingIndex(tide(), day({ windMaxMs: 12 }));
    expect(calm.breakdown.find((b) => b.key === "wind")!.value).toBe(20);
    expect(windy.breakdown.find((b) => b.key === "wind")!.value).toBe(0);
  });

  it("hourly 24時間分があればベスト時間帯を返す", () => {
    const r = calcFishingIndex(tide(), day());
    expect(r.best).not.toBeNull();
    const none = calcFishingIndex(tide(), day({ hourly: [] }));
    expect(none.best).toBeNull();
  });
});

describe("fishingIndexLabel", () => {
  it("境界値", () => {
    expect(fishingIndexLabel(85)).toBe("絶好");
    expect(fishingIndexLabel(84)).toBe("かなり良い");
    expect(fishingIndexLabel(70)).toBe("かなり良い");
    expect(fishingIndexLabel(69)).toBe("まずまず");
    expect(fishingIndexLabel(55)).toBe("まずまず");
    expect(fishingIndexLabel(54)).toBe("やや厳しい");
    expect(fishingIndexLabel(40)).toBe("やや厳しい");
    expect(fishingIndexLabel(39)).toBe("見送り推奨");
  });
});
