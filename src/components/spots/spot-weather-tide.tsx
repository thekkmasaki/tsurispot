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
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
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
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia%2FTokyo&forecast_days=1`
        );
        const data = await res.json();
        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m,
          maxTemp: data.daily.temperature_2m_max[0],
          minTemp: data.daily.temperature_2m_min[0],
          sunrise: data.daily.sunrise[0]?.split("T")[1]?.slice(0, 5) ?? "",
          sunset: data.daily.sunset[0]?.split("T")[1]?.slice(0, 5) ?? "",
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
                    <span>{weather.maxTemp}° / {weather.minTemp}°</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="h-3 w-3" />
                    <span>風速 {weather.windSpeed} km/h</span>
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

        <p className="mt-2 text-[10px] text-muted-foreground">
          ※ 天気はOpen-Meteoの予報データ。潮汐は月齢に基づく概算値で、実際の潮位とは異なる場合があります。
        </p>
      </CardContent>
    </Card>
  );
}
