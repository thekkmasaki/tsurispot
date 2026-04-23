import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  CloudSun,
} from "lucide-react";

export interface HourlyWeatherData {
  temp: number;
  weatherCode: number;
  windSpeed: number; // km/h
  windDirection: number;
}

export interface DailyWeatherData {
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  windDirection: number;
  seaTemp: number | null;
  hourly: HourlyWeatherData[]; // 24時間分
}

export interface WeatherData {
  // Current (today only)
  currentTemp: number;
  currentWeatherCode: number;
  currentWindSpeed: number;
  currentWindDirection: number;
  // Daily forecasts (14 days)
  daily: DailyWeatherData[];
}

export interface TideInfo {
  moonAge: number;
  tideType: string;
  tideLabel: string;
  fishingScore: number;
  highTides: string[];
  lowTides: string[];
  description: string;
}

export interface BestTimeResult {
  startHour: number;
  endHour: number;
  score: number;
  reasons: string[];
  detail: string; // 具体的な根拠説明
}

// 体感温度（Wind Chill）計算
// JAG/TI方式: T: 気温(℃), V: 風速(km/h)
export function calcWindChill(tempC: number, windKmh: number): number {
  // 風速1.3m/s(≒4.8km/h)未満 or 気温10℃超の場合は体感温度≒気温
  if (windKmh < 4.8 || tempC > 10) return tempC;
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16);
  return Math.round(wc * 10) / 10;
}

// 風向（度）→ 日本語ラベル
export function getWindDirectionLabel(deg: number): string {
  const dirs = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// 風向（度）→ CSSの回転角度（北=0°を上として時計回り）
export function getWindRotation(deg: number): number {
  return deg;
}

// WMO天気コード → アイコン & ラベル
export function getWeatherInfo(code: number) {
  if (code === 0) return { icon: Sun, label: "快晴", color: "text-amber-500" };
  if (code <= 2) return { icon: CloudSun, label: "晴れ", color: "text-amber-400" };
  if (code === 3) return { icon: Cloud, label: "曇り", color: "text-gray-500" };
  if (code <= 49) return { icon: CloudFog, label: "霧", color: "text-gray-400" };
  if (code <= 59) return { icon: CloudDrizzle, label: "小雨", color: "text-blue-400" };
  if (code <= 69) return { icon: CloudRain, label: "雨", color: "text-blue-500" };
  if (code <= 79) return { icon: CloudSnow, label: "雪", color: "text-blue-200" };
  if (code <= 84) return { icon: CloudRain, label: "にわか雨", color: "text-blue-500" };
  if (code <= 94) return { icon: CloudSnow, label: "にわか雪", color: "text-blue-300" };
  return { icon: CloudLightning, label: "雷雨", color: "text-purple-500" };
}

// 月齢計算（簡易版）
export function getMoonAge(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 修正ユリウス日から月齢を算出
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  const moonAge = ((JD - 2451550.1) % 29.530588853);
  return moonAge < 0 ? moonAge + 29.530588853 : moonAge;
}

// 月齢から潮の種類を判定
export function getTideInfo(moonAge: number, lng: number): TideInfo {
  // 概算の満潮・干潮時刻（月齢と経度から推定）
  // 月の南中時刻 ≒ 月齢 × 48分 のずれ
  const baseHour = (moonAge * 0.8) % 24;
  const lngOffset = (lng - 135) / 15; // 日本標準時からのずれ

  const high1 = (baseHour + lngOffset + 24) % 24;
  const high2 = (high1 + 12.4) % 24;
  const low1 = (high1 + 6.2) % 24;
  const low2 = (low1 + 12.4) % 24;

  const formatTime = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.floor((h - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const highTides = [formatTime(high1), formatTime(high2)].sort();
  const lowTides = [formatTime(low1), formatTime(low2)].sort();

  // 潮の種類と釣りスコア
  let tideType: string;
  let tideLabel: string;
  let fishingScore: number;
  let description: string;

  const age = Math.round(moonAge * 10) / 10;

  if (age <= 1.5 || age >= 28) {
    tideType = "大潮";
    tideLabel = "大潮";
    fishingScore = 5;
    description = "潮の動きが最も大きく、魚の活性が上がりやすい。特に潮の変わり目が狙い目。";
  } else if (age <= 4 || (age >= 25 && age < 28)) {
    tideType = "中潮";
    tideLabel = "中潮";
    fishingScore = 4;
    description = "適度な潮の流れがあり、安定した釣果が期待できる。";
  } else if (age <= 6 || (age >= 23 && age < 25)) {
    tideType = "小潮";
    tideLabel = "小潮";
    fishingScore = 2;
    description = "潮の動きが小さめ。底物狙いやじっくり攻める釣りに向いている。";
  } else if (age <= 8 || (age >= 21 && age < 23)) {
    tideType = "長潮";
    tideLabel = "長潮";
    fishingScore = 1;
    description = "潮の干満差が最も小さい。厳しい条件だが、タイミング次第では可能性あり。";
  } else if (age <= 10 || (age >= 19 && age < 21)) {
    tideType = "若潮";
    tideLabel = "若潮";
    fishingScore = 2;
    description = "潮が徐々に大きくなる時期。朝マズメ・夕マズメを狙うと良い。";
  } else if (age <= 16) {
    if (age <= 12 || age >= 15.5) {
      tideType = "中潮";
      tideLabel = "中潮";
      fishingScore = 4;
      description = "適度な潮の流れがあり、安定した釣果が期待できる。";
    } else {
      tideType = "大潮";
      tideLabel = "大潮";
      fishingScore = 5;
      description = "満月の大潮。夜釣りで特に効果的。潮の変わり目を逃さずに。";
    }
  } else {
    tideType = "中潮";
    tideLabel = "中潮";
    fishingScore = 3;
    description = "まずまずの潮回り。朝夕のマズメ時を中心に狙うと良い。";
  }

  return {
    moonAge: age,
    tideType,
    tideLabel,
    fishingScore,
    highTides,
    lowTides,
    description,
  };
}

// おすすめ時間帯の算出
export function calcBestFishingTime(
  hourly: HourlyWeatherData[],
  sunriseStr: string,
  sunsetStr: string,
  highTides: string[],
  lowTides: string[],
): BestTimeResult | null {
  if (!hourly || hourly.length < 24) return null;

  const sunriseH = parseInt(sunriseStr.split(":")[0], 10);
  const sunsetH = parseInt(sunsetStr.split(":")[0], 10);

  // 潮の変わり目時刻（時単位 + 元の文字列）
  const tideChanges = [
    ...highTides.map((t) => ({ time: t, type: "満潮" as const, h: parseInt(t.split(":")[0], 10) + parseInt(t.split(":")[1], 10) / 60 })),
    ...lowTides.map((t) => ({ time: t, type: "干潮" as const, h: parseInt(t.split(":")[0], 10) + parseInt(t.split(":")[1], 10) / 60 })),
  ];

  // 各時間のスコア計算
  const scores = hourly.map((h, hour) => {
    let s = 0;
    const reasons: string[] = [];
    const windMs = h.windSpeed / 3.6;

    // マズメ（日出前後1h、日没前後1h）
    if (Math.abs(hour - sunriseH) <= 1) {
      s += 4;
      reasons.push(`朝マズメ（日出${sunriseStr}）`);
    } else if (Math.abs(hour - sunsetH) <= 1) {
      s += 4;
      reasons.push(`夕マズメ（日没${sunsetStr}）`);
    }

    // 潮の変わり目（±1.5h）
    for (const tc of tideChanges) {
      if (Math.abs(hour - tc.h) <= 1.5) {
        s += 3;
        reasons.push(`${tc.type}${tc.time}前後`);
        break;
      }
    }

    // 天気: 晴れ〜曇りは良い、雨は減点
    if (h.weatherCode <= 3) {
      s += 1;
    } else if (h.weatherCode >= 51) {
      s -= 2;
    }

    // 風速: 弱風は良い、強風は減点
    if (windMs < 3) {
      s += 2;
    } else if (windMs < 5) {
      s += 1;
    } else if (windMs >= 10) {
      s -= 3;
    } else if (windMs >= 7) {
      s -= 1;
    }

    // 深夜帯は減点（0-3時）
    if (hour >= 0 && hour <= 3) {
      s -= 1;
    }

    return { hour, score: s, reasons };
  });

  // 連続2時間の最高スコアウィンドウを探す
  let bestStart = 0;
  let bestSum = -Infinity;
  for (let i = 0; i < 23; i++) {
    const sum = scores[i].score + scores[i + 1].score;
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = i;
    }
  }

  // 理由を集約（重複排除、具体時刻付き）
  const reasonSet = new Set<string>();
  for (let i = bestStart; i <= bestStart + 1; i++) {
    scores[i].reasons.forEach((r) => reasonSet.add(r));
  }

  // 風情報
  const avgWind = (hourly[bestStart].windSpeed + hourly[bestStart + 1].windSpeed) / 2 / 3.6;

  // 詳細説明を生成
  const detailParts: string[] = [];
  for (const r of reasonSet) {
    detailParts.push(r);
  }
  if (avgWind < 3) {
    detailParts.push(`風速${avgWind.toFixed(1)}m/sで穏やか`);
  } else if (avgWind < 5) {
    detailParts.push(`風速${avgWind.toFixed(1)}m/s`);
  }

  // reasonsはタグ用（短いラベル）
  const tags: string[] = [];
  for (const r of reasonSet) {
    if (r.includes("朝マズメ")) tags.push("朝マズメ");
    else if (r.includes("夕マズメ")) tags.push("夕マズメ");
    else if (r.includes("満潮") || r.includes("干潮")) tags.push("潮の変わり目");
  }
  if (avgWind < 3) tags.push("風が穏やか");

  return {
    startHour: bestStart,
    endHour: bestStart + 2,
    score: bestSum,
    reasons: tags,
    detail: detailParts.join("、"),
  };
}

// 14日間の日付リストを生成
export function generate14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}
