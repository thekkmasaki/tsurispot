"use client";

import { useState, useEffect } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Sun,
  CloudSun,
  Wind,
  Waves,
  Moon,
  Sunrise,
  Sunset,
  ThermometerSun,
  Navigation,
  ThermometerSnowflake,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpotWeatherTideProps {
  lat: number;
  lng: number;
  spotName: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  seaTemp: number | null;
  warnings: string[];
}

interface TideInfo {
  moonAge: number;
  tideType: string;
  tideLabel: string;
  fishingScore: number;
  highTides: string[];
  lowTides: string[];
  description: string;
}

// 風向（度）→ 日本語ラベル
function getWindDirectionLabel(deg: number): string {
  const dirs = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// 風向（度）→ CSSの回転角度（北=0°を上として時計回り）
function getWindRotation(deg: number): number {
  return deg;
}

// WMO天気コード → アイコン & ラベル
function getWeatherInfo(code: number) {
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
function getMoonAge(date: Date): number {
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
function getTideInfo(moonAge: number, lng: number): TideInfo {
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

// 緯度経度から最寄りの気象庁地域コードを推定し、警報・注意報を取得
async function fetchJmaWarnings(lat: number, lng: number): Promise<string[]> {
  try {
    // 気象庁の警報・注意報JSON（全国一括）
    const res = await fetch("https://www.jma.go.jp/bosai/warning/data/warning/overview.json");
    if (!res.ok) return [];
    const data: { office: string; areaName: string; warnings?: string; status?: string }[] = await res.json();
    if (!Array.isArray(data)) return [];

    // 地域名からマッチングするため、都道府県名を緯度経度から推定
    const prefName = estimatePrefecture(lat, lng);
    if (!prefName) return [];

    const warnings: string[] = [];
    for (const entry of data) {
      if (entry.areaName?.includes(prefName) && entry.status && entry.status !== "なし" && entry.status !== "") {
        if (entry.warnings) warnings.push(entry.warnings);
        if (entry.status) warnings.push(entry.status);
      }
    }
    return warnings;
  } catch {
    return [];
  }
}

// 緯度経度から都道府県名を推定（簡易版）
function estimatePrefecture(lat: number, lng: number): string {
  // 主要な都道府県の緯度経度中心から最も近いものを返す
  const prefs: [string, number, number][] = [
    ["北海道", 43.06, 141.35], ["青森", 40.82, 140.74], ["岩手", 39.70, 141.15],
    ["宮城", 38.27, 140.87], ["秋田", 39.72, 140.10], ["山形", 38.24, 140.33],
    ["福島", 37.75, 140.47], ["茨城", 36.34, 140.45], ["栃木", 36.57, 139.88],
    ["群馬", 36.39, 139.06], ["埼玉", 35.86, 139.65], ["千葉", 35.60, 140.12],
    ["東京", 35.68, 139.69], ["神奈川", 35.45, 139.64], ["新潟", 37.90, 139.02],
    ["富山", 36.69, 137.21], ["石川", 36.59, 136.63], ["福井", 36.07, 136.22],
    ["山梨", 35.66, 138.57], ["長野", 36.23, 138.18], ["岐阜", 35.39, 136.72],
    ["静岡", 34.98, 138.38], ["愛知", 35.18, 136.91], ["三重", 34.73, 136.51],
    ["滋賀", 35.00, 135.87], ["京都", 35.02, 135.77], ["大阪", 34.69, 135.52],
    ["兵庫", 34.69, 135.18], ["奈良", 34.69, 135.83], ["和歌山", 34.23, 135.17],
    ["鳥取", 35.50, 134.24], ["島根", 35.47, 133.05], ["岡山", 34.66, 133.93],
    ["広島", 34.40, 132.46], ["山口", 34.19, 131.47], ["徳島", 34.07, 134.56],
    ["香川", 34.34, 134.04], ["愛媛", 33.84, 132.77], ["高知", 33.56, 133.53],
    ["福岡", 33.61, 130.42], ["佐賀", 33.25, 130.30], ["長崎", 32.74, 129.87],
    ["熊本", 32.79, 130.74], ["大分", 33.24, 131.61], ["宮崎", 31.91, 131.42],
    ["鹿児島", 31.56, 130.56], ["沖縄", 26.34, 127.80],
  ];
  let nearest = prefs[0][0];
  let minDist = Infinity;
  for (const [name, plat, plng] of prefs) {
    const d = (lat - plat) ** 2 + (lng - plng) ** 2;
    if (d < minDist) { minDist = d; nearest = name; }
  }
  return nearest;
}

function FishingScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">釣り日和</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-4 rounded-sm",
              i < score ? "bg-emerald-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function SpotWeatherTide({ lat, lng, spotName }: SpotWeatherTideProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const tideInfo = getTideInfo(getMoonAge(new Date()), lng);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // 天気API（風向追加）
        const weatherPromise = fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia%2FTokyo&forecast_days=1`
        ).then(r => r.json());

        // 海水温API（Marine API）
        const marinePromise = fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=sea_surface_temperature&timezone=Asia%2FTokyo`
        ).then(r => r.json()).catch(() => null);

        // 気象庁警報・注意報API
        const warningPromise = fetchJmaWarnings(lat, lng);

        const [data, marine, warnings] = await Promise.all([weatherPromise, marinePromise, warningPromise]);

        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
          maxTemp: data.daily.temperature_2m_max[0],
          minTemp: data.daily.temperature_2m_min[0],
          sunrise: data.daily.sunrise[0]?.split("T")[1]?.slice(0, 5) ?? "",
          sunset: data.daily.sunset[0]?.split("T")[1]?.slice(0, 5) ?? "",
          seaTemp: marine?.current?.sea_surface_temperature ?? null,
          warnings,
        });
      } catch {
        // API失敗時は天気表示なし
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lng]);

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;
  const WeatherIcon = weatherInfo?.icon ?? Sun;

  return (
    <Card className="overflow-hidden">
      <div className="bg-sky-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-5 w-5 text-sky-600" />
          <h3 className="font-bold text-sm">今日のコンディション</h3>
        </div>
        <FishingScoreBar score={tideInfo.fishingScore} />
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 天気セクション */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Cloud className="h-3.5 w-3.5" />
              天気
            </h4>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 w-20 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
            ) : weather ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <WeatherIcon className={cn("h-8 w-8", weatherInfo?.color)} />
                  <div>
                    <div className="text-2xl font-bold">{weather.temperature}°</div>
                    <div className="text-xs text-muted-foreground">{weatherInfo?.label}</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="h-3 w-3" />
                    <span>気温 {weather.minTemp}〜{weather.maxTemp}°C</span>
                  </div>
                  {weather.seaTemp !== null && (
                    <div className="flex items-center gap-1.5">
                      <ThermometerSnowflake className="h-3 w-3 text-cyan-500" />
                      <span className="font-medium text-cyan-700">水温 {weather.seaTemp.toFixed(1)}°C</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Navigation
                      className="h-3 w-3 text-sky-500"
                      style={{ transform: `rotate(${getWindRotation(weather.windDirection)}deg)` }}
                    />
                    <span>風向 {getWindDirectionLabel(weather.windDirection)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="h-3 w-3" />
                    <span>風速 {(weather.windSpeed / 3.6).toFixed(1)}m/s</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="h-3 w-3" />
                    <span>{weather.sunrise}</span>
                    <Sunset className="h-3 w-3 ml-1" />
                    <span>{weather.sunset}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">天気情報を取得できませんでした</p>
            )}
          </div>

          {/* 潮汐セクション */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Waves className="h-3.5 w-3.5" />
              潮回り
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center rounded-lg h-10 w-10",
                  tideInfo.fishingScore >= 4 ? "bg-emerald-100" :
                  tideInfo.fishingScore >= 3 ? "bg-blue-100" :
                  "bg-amber-100"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    tideInfo.fishingScore >= 4 ? "text-emerald-700" :
                    tideInfo.fishingScore >= 3 ? "text-blue-700" :
                    "text-amber-700"
                  )}>
                    {tideInfo.tideLabel}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Moon className="h-3 w-3" />
                    <span>月齢 {tideInfo.moonAge.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span>満潮 {tideInfo.highTides.join(" / ")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3 w-3 text-gray-400" />
                  <span>干潮 {tideInfo.lowTides.join(" / ")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 潮の解説 */}
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-muted-foreground leading-relaxed">{tideInfo.description}</p>
        </div>

        {/* 強風警告 */}
        {weather && (() => {
          const windMs = weather.windSpeed / 3.6;
          if (windMs >= 15) {
            return (
              <div className="mt-3 rounded-lg bg-red-50 border-2 border-red-400 px-3 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                  <span className="text-sm font-bold text-red-700">暴風警告：釣り中止を強く推奨</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  現在の風速は<span className="font-bold">{windMs.toFixed(1)}m/s</span>で非常に危険な状態です。
                  堤防・テトラでは波にさらわれる危険があります。釣行は中止してください。
                </p>
              </div>
            );
          }
          if (windMs >= 10) {
            return (
              <div className="mt-3 rounded-lg bg-orange-50 border-2 border-orange-400 px-3 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-bold text-orange-700">強風注意：釣行は危険です</span>
                </div>
                <p className="text-xs text-orange-700 leading-relaxed">
                  現在の風速は<span className="font-bold">{windMs.toFixed(1)}m/s</span>です。
                  テトラや磯場は波しぶきの危険あり。仕掛けも流されやすく釣りになりません。中止・延期を検討してください。
                </p>
              </div>
            );
          }
          if (windMs >= 7) {
            return (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-300 px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">やや強い風（{windMs.toFixed(1)}m/s）</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  軽い仕掛けは流されやすいです。重めのオモリを使い、風裏のポイントを選びましょう。帽子・荷物の飛散にも注意。
                </p>
              </div>
            );
          }
          if (windMs >= 5) {
            return (
              <div className="mt-3 rounded-lg bg-sky-50 border border-sky-200 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-sky-600" />
                  <span className="text-xs text-sky-700">風あり（{windMs.toFixed(1)}m/s）— 釣りは可能ですが仕掛けの調整が必要</span>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* 警報・注意報 */}
        {weather && weather.warnings.length > 0 && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">注意報・警報</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              {weather.warnings.join("、")}
            </p>
          </div>
        )}

        {weather && weather.warnings.length === 0 && (weather.windSpeed / 3.6) < 5 && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-700">警報：なし　注意報：なし</span>
            </div>
          </div>
        )}

        <p className="mt-2 text-[10px] text-muted-foreground">
          ※ 天気・水温はOpen-Meteoの予報データ。潮汐は月齢に基づく概算値で、実際の潮位とは異なる場合があります。
        </p>
      </CardContent>
    </Card>
  );
}
