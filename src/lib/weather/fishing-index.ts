/**
 * 今日の釣行指数（案③）。0-100 の合成スコア。
 * 重み: 潮35 / マヅメ25 / 風20 / 天気15 / 水温5
 * 水温（海面水温）が取れない内陸・河川スポットは配点を「潮35/マヅメ25/風20/天気20」に切り替える
 * （欠損値をでっち上げず、配点表ごと変えて説明可能性を保つ）。
 *
 * 設計原則: 内訳の合計 = 総合点（1点もズレない）。計算方法は全部ユーザーに見せる。
 * 時間帯おすすめは既存 calcBestFishingTime（マヅメ+4/潮変わり目+3/…）をそのまま使う。
 */
import {
  calcBestFishingTime,
  type BestTimeResult,
  type TideInfo,
} from "./calculations";
import type { DayWeatherDigest } from "./open-meteo";

export interface IndexBreakdownRow {
  key: "tide" | "twilight" | "wind" | "weather" | "seaTemp";
  label: string;
  value: number;
  max: number;
  reason: string;
}

export interface FishingIndexResult {
  score: number;
  label: string;
  breakdown: IndexBreakdownRow[];
  tide: TideInfo;
  best: BestTimeResult | null;
  profile: "marine" | "no-sea-temp";
}

export function fishingIndexLabel(score: number): string {
  if (score >= 85) return "絶好";
  if (score >= 70) return "かなり良い";
  if (score >= 55) return "まずまず";
  if (score >= 40) return "やや厳しい";
  return "見送り推奨";
}

function isRainCode(code: number): boolean {
  return code >= 51;
}

/** マヅメ帯（時刻±1h）の hourly に雨があるか */
function rainAtTwilight(day: DayWeatherDigest, timeHHMM: string): boolean {
  if (day.hourly.length < 24) return false;
  const hour = Number(timeHHMM.slice(0, 2));
  if (Number.isNaN(hour)) return false;
  for (let h = Math.max(0, hour - 1); h <= Math.min(23, hour + 1); h++) {
    if (isRainCode(day.hourly[h]?.weatherCode ?? 0)) return true;
  }
  return false;
}

function tidePoints(tide: TideInfo): IndexBreakdownRow {
  // fishingScore は 1-5（大潮5/中潮3-4/小潮・若潮2/長潮1）→ 35点満点に線形マップ
  const value = Math.round((tide.fishingScore / 5) * 35);
  return {
    key: "tide",
    label: `潮回り（${tide.tideLabel}・月齢${tide.moonAge.toFixed(1)}）`,
    value,
    max: 35,
    reason: tide.description,
  };
}

function twilightPoints(day: DayWeatherDigest): IndexBreakdownRow {
  const morningRain = rainAtTwilight(day, day.sunrise);
  const eveningRain = rainAtTwilight(day, day.sunset);
  const value = 25 - (morningRain ? 5 : 0) - (eveningRain ? 5 : 0);
  let reason = `朝マヅメ（日出${day.sunrise}）・夕マヅメ（日没${day.sunset}）の両方が狙えます。`;
  if (morningRain && eveningRain) {
    reason = "朝夕どちらのマヅメも雨予報。時合いの威力が落ちます。";
  } else if (morningRain) {
    reason = `朝マヅメが雨予報。夕マヅメ（日没${day.sunset}）が本命です。`;
  } else if (eveningRain) {
    reason = `夕マヅメが雨予報。朝マヅメ（日出${day.sunrise}）が本命です。`;
  }
  return { key: "twilight", label: "マヅメ", value, max: 25, reason };
}

function windPoints(day: DayWeatherDigest): IndexBreakdownRow {
  const w = day.windMaxMs;
  // 無風20点から風速1m/sごとに約2点減点（説明しやすい線形則）
  const value = Math.max(0, Math.min(20, Math.round(20 - w * 2)));
  let reason: string;
  if (w < 3) reason = "弱風。ウキ・サビキとも扱いやすいコンディションです。";
  else if (w < 5) reason = "そよ風程度。釣りに支障はありません。";
  else if (w < 7) reason = "やや風があります。仕掛けは重めが無難です。";
  else if (w < 10) reason = "強風気味。風裏になる釣り座を選びたい日です。";
  else reason = "強風。無理な釣行は避け、安全を最優先に。";
  return {
    key: "wind",
    label: `風（最大${w.toFixed(1)}m/s）`,
    value,
    max: 20,
    reason,
  };
}

const WEATHER_LABELS: [number, string][] = [
  [0, "快晴"],
  [1, "晴れ"],
  [2, "晴れ時々曇り"],
  [3, "曇り"],
  [45, "霧"],
  [48, "霧氷"],
  [51, "霧雨"],
  [61, "雨"],
  [71, "雪"],
  [80, "にわか雨"],
  [95, "雷雨"],
];

function weatherLabel(code: number): string {
  let label = "曇り";
  for (const [c, l] of WEATHER_LABELS) {
    if (code >= c) label = l;
  }
  return label;
}

function weatherPoints(
  day: DayWeatherDigest,
  max: 15 | 20,
): IndexBreakdownRow {
  const code = day.weatherCode;
  // 天気コード帯ごとの基礎点（max=15 が海用 / max=20 が水温欠損時の振替つき）
  let base: number;
  if (code <= 1) base = max === 15 ? 14 : 19;
  else if (code <= 3) base = max === 15 ? 11 : 15;
  else if (code === 45 || code === 48) base = max === 15 ? 9 : 12;
  else if (code >= 95) base = max === 15 ? 2 : 3;
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    base = max === 15 ? 3 : 4; // 雪（85/86 は snow showers）
  else if (code >= 51) base = max === 15 ? 5 : 7;
  else base = max === 15 ? 8 : 10;

  const notes: string[] = [`${weatherLabel(code)}・最高${Math.round(day.tempMax)}℃`];
  if (day.tempMax >= 35) {
    base -= 6;
    notes.push("猛暑日。熱中症警戒、日中の釣行は避けたい");
  } else if (day.tempMax >= 33) {
    base -= 4;
    notes.push("熱中症警戒。朝夕の涼しい時間帯に");
  } else if (day.tempMax <= 2) {
    base -= 3;
    notes.push("厳寒。防寒と足元の凍結に注意");
  }
  const value = Math.max(0, Math.min(max, base));
  return {
    key: "weather",
    label: `天気（${weatherLabel(code)} ${Math.round(day.tempMax)}℃）`,
    value,
    max,
    reason: notes.join("。") + "。",
  };
}

function seaTempPoints(seaTempC: number): IndexBreakdownRow {
  const t = seaTempC;
  let value: number;
  let reason: string;
  if (t >= 14 && t <= 25) {
    value = 5;
    reason = "多くの魚が動きやすい適水温です。";
  } else if (t > 25 && t <= 27) {
    value = 4;
    reason = "やや高め。朝夕の時間帯が有利です。";
  } else if (t > 27 && t <= 29) {
    value = 3;
    reason = "高水温。日中は活性が落ちやすい水温です。";
  } else if (t >= 10 && t < 14) {
    value = 2;
    reason = "低め。深場やテトラ際など水温の安定する場所を。";
  } else {
    value = 1;
    reason = "水温がかなり極端です。魚種を選ぶ釣りになります。";
  }
  return {
    key: "seaTemp",
    label: `水温（${t.toFixed(1)}℃）`,
    value,
    max: 5,
    reason,
  };
}

/**
 * 1スポット×1日の指数を計算する。
 * @param tide その日・そのスポットの潮情報（呼出側が @/lib/tide で解決して渡す。
 *             満干時刻は気象庁 潮位表データ由来。誤差の大きい近似式へのフォールバックはしない）
 * @param day その日の天気ダイジェスト
 */
export function calcFishingIndex(
  tide: TideInfo,
  day: DayWeatherDigest,
): FishingIndexResult {
  const profile: FishingIndexResult["profile"] =
    day.seaTempC === null ? "no-sea-temp" : "marine";

  const breakdown: IndexBreakdownRow[] = [
    tidePoints(tide),
    twilightPoints(day),
    windPoints(day),
    weatherPoints(day, profile === "marine" ? 15 : 20),
  ];
  if (profile === "marine" && day.seaTempC !== null) {
    breakdown.push(seaTempPoints(day.seaTempC));
  }

  const score = breakdown.reduce((sum, row) => sum + row.value, 0);

  const best =
    day.hourly.length >= 24
      ? calcBestFishingTime(
          day.hourly,
          day.sunrise,
          day.sunset,
          tide.highTides,
          tide.lowTides,
        )
      : null;

  return {
    score,
    label: fishingIndexLabel(score),
    breakdown,
    tide,
    best,
    profile,
  };
}
