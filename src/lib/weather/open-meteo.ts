/**
 * Open-Meteo のサーバー側 fetch（案③）。
 * 既存は spot-weather-tide.tsx がクライアントからしか叩いていないため、
 * 指数API・Push 送信で使えるようサーバー経路を新設する。
 * - 座標は小数2桁（約1.1km）に丸めて URL を正規化 → Next の fetch キャッシュ (revalidate 1h) が座標単位で効く
 * - Marine（海面水温）は内陸・河川では取得できないため null を許容する
 */
import type { HourlyWeatherData } from "./calculations";

export interface DayWeatherDigest {
  date: string; // YYYY-MM-DD (JST)
  weatherCode: number;
  tempMax: number;
  windMaxMs: number; // m/s
  sunrise: string; // "HH:MM"
  sunset: string; // "HH:MM"
  /** その日の24時間分（Open-Meteo は km/h。calcBestFishingTime も km/h 前提） */
  hourly: HourlyWeatherData[];
  seaTempC: number | null;
}

export interface SpotForecast {
  days: DayWeatherDigest[]; // 最大7日
}

interface ForecastApiResponse {
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    sunrise?: string[];
    sunset?: string[];
    wind_speed_10m_max?: number[];
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
  };
}

interface MarineApiResponse {
  daily?: {
    time?: string[];
    sea_surface_temperature_max?: (number | null)[];
  };
}

const REVALIDATE_SEC = 3600;
const FORECAST_DAYS = 7;
const FETCH_TIMEOUT_MS = 8000;

// POST Route Handler 内の fetch は Next の Data Cache 対象外（公式ドキュメント明記）のため、
// next.revalidate に頼らずプロセス内メモでも重複取得を抑える（App Runner は実質1インスタンス）
const MEMO_TTL_MS = 30 * 60 * 1000;
const MEMO_FAIL_TTL_MS = 5 * 60 * 1000;
const memo = new Map<string, { t: number; data: SpotForecast | null }>();

function roundCoord(v: number): string {
  return v.toFixed(2);
}

export async function fetchSpotForecast(
  latitude: number,
  longitude: number,
): Promise<SpotForecast | null> {
  const lat = roundCoord(latitude);
  const lng = roundCoord(longitude);

  const memoKey = `${lat},${lng}`;
  const hit = memo.get(memoKey);
  if (hit && Date.now() - hit.t < (hit.data ? MEMO_TTL_MS : MEMO_FAIL_TTL_MS)) {
    return hit.data;
  }

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weather_code,temperature_2m_max,sunrise,sunset,wind_speed_10m_max` +
    `&hourly=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m` +
    `&timezone=Asia%2FTokyo&forecast_days=${FORECAST_DAYS}`;
  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
    `&daily=sea_surface_temperature_max&timezone=Asia%2FTokyo&forecast_days=${FORECAST_DAYS}`;

  const [forecast, marine] = await Promise.all([
    fetch(forecastUrl, {
      next: { revalidate: REVALIDATE_SEC },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
      .then((r) => (r.ok ? (r.json() as Promise<ForecastApiResponse>) : null))
      .catch(() => null),
    fetch(marineUrl, {
      next: { revalidate: REVALIDATE_SEC },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
      .then((r) => (r.ok ? (r.json() as Promise<MarineApiResponse>) : null))
      .catch(() => null),
  ]);

  const daily = forecast?.daily;
  const hourly = forecast?.hourly;
  if (!daily?.time || daily.time.length === 0) {
    memo.set(memoKey, { t: Date.now(), data: null });
    return null;
  }

  const seaByDate = new Map<string, number | null>();
  const marineDaily = marine?.daily;
  if (marineDaily?.time) {
    marineDaily.time.forEach((t, i) => {
      seaByDate.set(t, marineDaily.sea_surface_temperature_max?.[i] ?? null);
    });
  }

  const days: DayWeatherDigest[] = daily.time.map((date, i) => {
    const hourly24: HourlyWeatherData[] = [];
    if (hourly?.time) {
      for (let h = 0; h < hourly.time.length; h++) {
        if (hourly.time[h].startsWith(date)) {
          hourly24.push({
            temp: hourly.temperature_2m?.[h] ?? 0,
            weatherCode: hourly.weather_code?.[h] ?? 0,
            windSpeed: hourly.wind_speed_10m?.[h] ?? 0, // km/h
            windDirection: hourly.wind_direction_10m?.[h] ?? 0,
          });
        }
      }
    }
    return {
      date,
      weatherCode: daily.weather_code?.[i] ?? 0,
      tempMax: daily.temperature_2m_max?.[i] ?? 0,
      windMaxMs: (daily.wind_speed_10m_max?.[i] ?? 0) / 3.6,
      sunrise: (daily.sunrise?.[i] ?? "").slice(11, 16) || "05:00",
      sunset: (daily.sunset?.[i] ?? "").slice(11, 16) || "18:00",
      hourly: hourly24,
      seaTempC: seaByDate.get(date) ?? null,
    };
  });

  const result = { days };
  memo.set(memoKey, { t: Date.now(), data: result });
  return result;
}
