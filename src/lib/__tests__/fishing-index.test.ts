import { describe, it, expect } from "vitest";
import { calcFishingIndex, fishingIndexLabel } from "@/lib/weather/fishing-index";
import type { DayWeatherDigest } from "@/lib/weather/open-meteo";
import type { HourlyWeatherData } from "@/lib/weather/calculations";

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

const LNG_TOKYO_BAY = 139.667;

describe("calcFishingIndex", () => {
  it("内訳の合計が必ず総合点に一致する（③の信頼性の要）", () => {
    for (const d of [
      day(),
      day({ seaTempC: null }),
      day({ weatherCode: 61, windMaxMs: 8, tempMax: 35 }),
      day({ weatherCode: 95, windMaxMs: 12, seaTempC: 30 }),
    ]) {
      const r = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, d);
      const sum = r.breakdown.reduce((a, b) => a + b.value, 0);
      expect(sum).toBe(r.score);
    }
  });

  it("スコアは0-100の範囲", () => {
    const good = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, day());
    const bad = calcFishingIndex(
      "2026-08-16",
      LNG_TOKYO_BAY,
      day({ weatherCode: 95, windMaxMs: 15, tempMax: 36, seaTempC: 31 }),
    );
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.score).toBeLessThanOrEqual(100);
    expect(bad.score).toBeGreaterThanOrEqual(0);
  });

  it("水温が取れないと配点プロファイルが切り替わる（天気が20点満点になる）", () => {
    const marine = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, day());
    const inland = calcFishingIndex(
      "2026-08-16",
      LNG_TOKYO_BAY,
      day({ seaTempC: null }),
    );
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

  it("マヅメ帯の雨で減点される", () => {
    const rainMorning = hourly();
    for (let h = 4; h <= 6; h++) rainMorning[h].weatherCode = 61;
    const r = calcFishingIndex(
      "2026-08-16",
      LNG_TOKYO_BAY,
      day({ hourly: rainMorning }),
    );
    const tw = r.breakdown.find((b) => b.key === "twilight")!;
    expect(tw.value).toBe(20);
    expect(tw.reason).toContain("朝マヅメが雨予報");
  });

  it("風は無風20点から線形減点", () => {
    const calm = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, day({ windMaxMs: 0 }));
    const windy = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, day({ windMaxMs: 12 }));
    expect(calm.breakdown.find((b) => b.key === "wind")!.value).toBe(20);
    expect(windy.breakdown.find((b) => b.key === "wind")!.value).toBe(0);
  });

  it("hourly 24時間分があればベスト時間帯を返す", () => {
    const r = calcFishingIndex("2026-08-16", LNG_TOKYO_BAY, day());
    expect(r.best).not.toBeNull();
    const none = calcFishingIndex(
      "2026-08-16",
      LNG_TOKYO_BAY,
      day({ hourly: [] }),
    );
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
