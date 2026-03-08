"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  OctagonAlert,
  Thermometer,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpotWeatherTideProps {
  lat: number;
  lng: number;
  spotName: string;
}

interface DailyWeatherData {
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  windDirection: number;
  seaTemp: number | null;
}

interface WeatherData {
  // Current (today only)
  currentTemp: number;
  currentWeatherCode: number;
  currentWindSpeed: number;
  currentWindDirection: number;
  // Daily forecasts (14 days)
  daily: DailyWeatherData[];
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

// 体感温度（Wind Chill）計算
// JAG/TI方式: T: 気温(℃), V: 風速(km/h)
function calcWindChill(tempC: number, windKmh: number): number {
  // 風速1.3m/s(≒4.8km/h)未満 or 気温10℃超の場合は体感温度≒気温
  if (windKmh < 4.8 || tempC > 10) return tempC;
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16);
  return Math.round(wc * 10) / 10;
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

// 14日間の日付リストを生成
function generate14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

// 曜日ラベル
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function SpotWeatherTide({ lat, lng, spotName }: SpotWeatherTideProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 14日間の日付
  const dates = generate14Days();
  const selectedDate = dates[selectedIndex];

  // 選択日の潮汐情報
  const tideInfo = getTideInfo(getMoonAge(selectedDate), lng);

  // 日付ヘッダーテキスト
  const getHeaderText = useCallback(() => {
    if (selectedIndex === 0) return "今日のコンディション";
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();
    const dow = DAY_LABELS[selectedDate.getDay()];
    return `${m}/${d}(${dow})のコンディション`;
  }, [selectedIndex, selectedDate]);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // 天気API（14日間予報）
        const weatherPromise = fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant&timezone=Asia%2FTokyo&forecast_days=14`
        ).then(r => r.json());

        // 海水温API（Marine API、14日間）
        const marinePromise = fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&daily=sea_surface_temperature_max&timezone=Asia%2FTokyo&forecast_days=14`
        ).then(r => r.json()).catch(() => null);

        const [data, marine] = await Promise.all([weatherPromise, marinePromise]);

        // 14日間のdailyデータを構築
        const dailyData: DailyWeatherData[] = [];
        const dailyCount = data.daily?.time?.length ?? 0;
        for (let i = 0; i < dailyCount; i++) {
          dailyData.push({
            weatherCode: data.daily.weather_code[i],
            maxTemp: data.daily.temperature_2m_max[i],
            minTemp: data.daily.temperature_2m_min[i],
            sunrise: data.daily.sunrise[i]?.split("T")[1]?.slice(0, 5) ?? "",
            sunset: data.daily.sunset[i]?.split("T")[1]?.slice(0, 5) ?? "",
            windSpeedMax: data.daily.wind_speed_10m_max[i],
            windDirection: data.daily.wind_direction_10m_dominant[i],
            seaTemp: marine?.daily?.sea_surface_temperature_max?.[i] ?? null,
          });
        }

        setWeather({
          currentTemp: data.current.temperature_2m,
          currentWeatherCode: data.current.weather_code,
          currentWindSpeed: data.current.wind_speed_10m,
          currentWindDirection: data.current.wind_direction_10m,
          daily: dailyData,
        });
      } catch {
        // API失敗時は天気表示なし
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lng]);

  // 選択日のデータ取得
  const isToday = selectedIndex === 0;
  const dailyData = weather?.daily[selectedIndex] ?? null;

  // 表示用の天気コード・温度・風速
  const displayWeatherCode = isToday ? weather?.currentWeatherCode ?? dailyData?.weatherCode ?? 0 : dailyData?.weatherCode ?? 0;
  const displayTemp = isToday ? weather?.currentTemp ?? 0 : null; // 未来日は現在気温なし
  const displayWindSpeed = isToday ? weather?.currentWindSpeed ?? 0 : dailyData?.windSpeedMax ?? 0; // km/h
  const displayWindDirection = isToday ? weather?.currentWindDirection ?? 0 : dailyData?.windDirection ?? 0;

  const weatherInfo = weather ? getWeatherInfo(displayWeatherCode) : null;
  const WeatherIcon = weatherInfo?.icon ?? Sun;

  return (
    <Card className="overflow-hidden">
      <div className="bg-sky-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-5 w-5 text-sky-600" />
          <h3 className="font-bold text-sm">{getHeaderText()}</h3>
        </div>
        <FishingScoreBar score={tideInfo.fishingScore} />
      </div>

      {/* 14日間の日付セレクター */}
      <div
        ref={scrollRef}
        className="flex gap-1 px-3 py-2 overflow-x-auto border-b scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {dates.map((date, i) => {
          const dayOfWeek = date.getDay();
          const isSat = dayOfWeek === 6;
          const isSun = dayOfWeek === 0;
          const isSelected = i === selectedIndex;
          const dayNum = date.getDate();
          const dowLabel = DAY_LABELS[dayOfWeek];

          return (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center rounded-lg px-2 py-1.5 min-w-[40px] transition-colors",
                isSelected
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200",
                !isSelected && isSat && "text-blue-600",
                !isSelected && isSun && "text-red-600",
              )}
            >
              {i === 0 ? (
                <>
                  <span className="text-[10px] font-medium leading-tight">今日</span>
                  <span className={cn(
                    "text-xs font-bold leading-tight",
                    isSelected ? "text-white" : isSat ? "text-blue-600" : isSun ? "text-red-600" : ""
                  )}>
                    {dayNum}
                  </span>
                </>
              ) : (
                <>
                  <span className={cn(
                    "text-[10px] leading-tight",
                    isSelected ? "text-white/80" : ""
                  )}>
                    {dowLabel}
                  </span>
                  <span className="text-xs font-bold leading-tight">
                    {dayNum}
                  </span>
                </>
              )}
            </button>
          );
        })}
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
            ) : weather && dailyData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <WeatherIcon className={cn("h-8 w-8", weatherInfo?.color)} />
                  <div>
                    {isToday ? (
                      <>
                        <div className="text-2xl font-bold">{displayTemp}°</div>
                        <div className="text-xs text-muted-foreground">{weatherInfo?.label}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-bold">
                          {dailyData.minTemp}°〜{dailyData.maxTemp}°
                        </div>
                        <div className="text-xs text-muted-foreground">{weatherInfo?.label}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {isToday && (
                    <div className="flex items-center gap-1.5">
                      <ThermometerSun className="h-3 w-3" />
                      <span>気温 {dailyData.minTemp}〜{dailyData.maxTemp}°C</span>
                    </div>
                  )}
                  {dailyData.seaTemp !== null && (
                    <div className="flex items-center gap-1.5">
                      <ThermometerSnowflake className="h-3 w-3 text-cyan-500" />
                      <span className="font-medium text-cyan-700">水温 {dailyData.seaTemp.toFixed(1)}°C</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Navigation
                      className="h-3 w-3 text-sky-500"
                      style={{ transform: `rotate(${getWindRotation(displayWindDirection)}deg)` }}
                    />
                    <span>風向 {getWindDirectionLabel(displayWindDirection)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="h-3 w-3" />
                    {isToday ? (
                      <span>風速 {(displayWindSpeed / 3.6).toFixed(1)}m/s</span>
                    ) : (
                      <span>最大風速 {(dailyData.windSpeedMax / 3.6).toFixed(1)}m/s</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="h-3 w-3" />
                    <span>{dailyData.sunrise}</span>
                    <Sunset className="h-3 w-3 ml-1" />
                    <span>{dailyData.sunset}</span>
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

        {/* 風速警告バナー */}
        {weather && dailyData && (() => {
          // 今日: 現在の風速で判定、未来: 日別最大風速で判定
          const windSpeedKmh = isToday ? weather.currentWindSpeed : dailyData.windSpeedMax;
          const windDir = isToday ? weather.currentWindDirection : dailyData.windDirection;
          const tempForChill = isToday ? weather.currentTemp : dailyData.maxTemp;
          const windMs = windSpeedKmh / 3.6;
          const windChill = calcWindChill(tempForChill, windSpeedKmh);
          const tempDiff = Math.round((tempForChill - windChill) * 10) / 10;
          const showWindChill = windMs >= 5 && tempDiff > 1;
          const isCold = windChill <= 5;
          const isVeryCold = windChill <= 0;

          // 防寒装備リンク
          const coldGearLinks = [
            { name: "防寒フィッシンググローブ", url: "https://amzn.to/3ZOdinM" },
            { name: "電熱ベスト", url: "https://amzn.to/40sdGZ6" },
            { name: "バラクラバ ネックウォーマー", url: "https://amzn.to/3ZMtLc7" },
          ];

          if (windMs >= 15) {
            return (
              <div className="mt-4 rounded-xl bg-red-600 text-white px-4 py-4 shadow-lg animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <OctagonAlert className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold mb-1">
                      {isToday ? "危険な風速です -- 釣りは中止してください" : "危険な風が予想されています -- 釣りは控えてください"}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1">
                        <Wind className="h-4 w-4" />
                        <span className="text-lg font-bold">{windMs.toFixed(1)}m/s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation
                          className="h-4 w-4"
                          style={{ transform: `rotate(${getWindRotation(windDir)}deg)` }}
                        />
                        <span className="text-sm">{getWindDirectionLabel(windDir)}の風</span>
                      </div>
                    </div>
                    <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
                      <li>堤防・テトラポッドは特に危険です</li>
                      <li>高波にも警戒してください</li>
                      <li>{isToday ? "安全な場所に避難し、釣行は中止してください" : "この日の釣行は中止してください"}</li>
                    </ul>
                    {showWindChill && (
                      <div className="mt-2 flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5 w-fit">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-sm">体感温度 <span className="font-bold">{windChill.toFixed(1)}°C</span>（気温より{tempDiff.toFixed(0)}°C低い）</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (windMs >= 10) {
            return (
              <div className="mt-4 space-y-2">
                <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold mb-1">
                        {isToday ? "釣りに適さない風の強さです" : "釣りに適さない風が予想されています"}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1">
                          <Wind className="h-4 w-4" />
                          <span className="text-lg font-bold">{windMs.toFixed(1)}m/s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation
                            className="h-4 w-4"
                            style={{ transform: `rotate(${getWindRotation(windDir)}deg)` }}
                          />
                          <span className="text-sm">{getWindDirectionLabel(windDir)}の風</span>
                        </div>
                      </div>
                      <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
                        <li>安全のため、風裏のポイントや釣行延期を検討してください</li>
                        <li>キャスティングが困難で、軽い仕掛けは使えません</li>
                        <li>防風・防寒装備は必須です</li>
                      </ul>
                      {showWindChill && (
                        <div className="mt-2 flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5 w-fit">
                          <Thermometer className="h-4 w-4" />
                          <span className="text-sm">体感温度 <span className="font-bold">{windChill.toFixed(1)}°C</span>（気温より{tempDiff.toFixed(0)}°C低い）</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 防寒装備おすすめ（寒い時のみ） */}
                {isCold && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2.5">
                    <div className="text-xs font-semibold text-orange-800 mb-1.5">
                      {isVeryCold ? "厳重な防寒対策が必要です" : "防寒装備をおすすめします"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coldGearLinks.map((item) => (
                        <a
                          key={item.url}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 text-xs bg-white border border-orange-200 rounded-full px-2.5 py-1 text-orange-700 hover:bg-orange-100 transition-colors"
                        >
                          {item.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (windMs >= 7) {
            return (
              <div className="mt-4 space-y-2">
                <div className="rounded-xl bg-amber-50 border-2 border-amber-400 px-4 py-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-amber-800 mb-1">
                        {isToday ? "風が強い状況です -- 釣りへの影響あり" : "風が強くなる予報です -- 釣りへの影響あり"}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5 bg-amber-100 rounded-lg px-2.5 py-1">
                          <Wind className="h-4 w-4 text-amber-700" />
                          <span className="text-base font-bold text-amber-800">{windMs.toFixed(1)}m/s</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-700">
                          <Navigation
                            className="h-3.5 w-3.5"
                            style={{ transform: `rotate(${getWindRotation(windDir)}deg)` }}
                          />
                          <span className="text-xs">{getWindDirectionLabel(windDir)}の風</span>
                        </div>
                      </div>
                      <ul className="text-xs text-amber-800 space-y-0.5 list-disc list-inside">
                        <li>軽い仕掛けは流されやすい -- 重めのオモリ推奨</li>
                        <li>キャスティングの精度が落ちます</li>
                        <li>帽子・荷物の飛散に注意</li>
                      </ul>
                      {showWindChill && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                          <Thermometer className="h-3.5 w-3.5" />
                          <span>体感温度 <span className="font-semibold">{windChill.toFixed(1)}°C</span>（気温より{tempDiff.toFixed(0)}°C低い）</span>
                        </div>
                      )}
                      {isCold && (
                        <div className="mt-1.5 text-xs text-amber-700">
                          風で体感温度が下がっています。防風ジャケット・手袋を推奨します。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 防寒装備おすすめ（寒い時のみ） */}
                {isCold && (
                  <div className="rounded-lg bg-amber-50/50 border border-amber-200 px-3 py-2">
                    <div className="text-xs font-semibold text-amber-800 mb-1.5">おすすめ防寒グッズ</div>
                    <div className="flex flex-wrap gap-2">
                      {coldGearLinks.slice(0, 2).map((item) => (
                        <a
                          key={item.url}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 rounded-full px-2.5 py-1 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          {item.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          if (windMs >= 5) {
            return (
              <div className="mt-3 rounded-lg bg-sky-50 border border-sky-300 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <Wind className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-sky-800">
                        {isToday ? `やや風が強い状況です（${windMs.toFixed(1)}m/s）` : `やや強い風が予想されています（${windMs.toFixed(1)}m/s）`}
                      </span>
                      <span className="text-xs text-sky-600">{getWindDirectionLabel(windDir)}の風</span>
                    </div>
                    <p className="text-xs text-sky-700">
                      釣りは可能ですが、仕掛けの調整が必要です。帽子・軽い仕掛けに注意してください。
                    </p>
                    {showWindChill && (
                      <p className="text-xs text-sky-600 mt-0.5">
                        風で体感温度が下がります（体感{windChill.toFixed(1)}°C）。上着を1枚多めにお持ちください。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })()}

        <p className="mt-2 text-[10px] text-muted-foreground">
          ※ 天気・水温はOpen-Meteoの予報データ。潮汐は月齢に基づく概算値で、実際の潮位とは異なる場合があります。
        </p>
      </CardContent>
    </Card>
  );
}
