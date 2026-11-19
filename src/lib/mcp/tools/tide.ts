// 潮汐・天気予報・釣行指数
import { getTideStationForSpot, getTideDisplayMode } from "@/lib/tide/nearest-station";
import { getTideDay } from "@/lib/tide/tide-data";
import { getMoonAgeJST, getTideTypeFromMoonAge } from "@/lib/tide/moon";
import { getTideInfoForDate } from "@/lib/tide/tide-info";
import { fetchSpotForecast } from "@/lib/weather/open-meteo";
import { calcFishingIndex } from "@/lib/weather/fishing-index";
import { getWeatherInfo } from "@/lib/weather/calculations";
import {
  type ToolDef,
  ToolError,
  ToolInputError,
  str,
  ymd,
  todayJST,
  addDaysYmd,
  requireSpot,
  round1,
  siteUrl,
} from "./shared";

// ---------------------------------------------------------------------------
// get_tide
// ---------------------------------------------------------------------------

export function getTide(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  const date = str(args.date, 10) ?? todayJST();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new ToolInputError("date は YYYY-MM-DD 形式で指定してください");
  }

  const phase = getTideTypeFromMoonAge(getMoonAgeJST(date));
  const mode = getTideDisplayMode(spot);
  const base = {
    spot: spot.name,
    date,
    tideType: phase.tideLabel,
    moonAge: Math.round(phase.moonAge * 10) / 10,
    url: siteUrl(`/spots/${spot.slug}`),
  };
  if (mode === "none") {
    return { ...base, note: "淡水（湖・池・内陸）のスポットのため潮汐の影響はありません" };
  }
  const station = getTideStationForSpot(spot);
  const day = station && mode === "full" ? getTideDay(station.code, date) : null;
  if (!station || !day) {
    return {
      ...base,
      note:
        mode === "phase-only"
          ? "河川のスポットのため潮回りのみ表示しています"
          : "この日付の満干潮データはまだありません（潮回りのみ）",
    };
  }
  return {
    ...base,
    station: `${station.name}（約${station.distanceKm}km）`,
    highTides: day.hi.map(([t, cm]) => ({ time: t, levelCm: cm })),
    lowTides: day.lo.map(([t, cm]) => ({ time: t, levelCm: cm })),
    source: "気象庁 潮位表（天文潮推算値）",
  };
}

// ---------------------------------------------------------------------------
// get_fishing_forecast
// ---------------------------------------------------------------------------

const FORECAST_DAYS = 7;
const DIRS = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];

/** 日中（5〜18時）の風向をベクトル平均して16方位で返す */
function daytimeWindDirection(hourly: { windDirection: number; windSpeed: number }[]): string | undefined {
  const day = hourly.slice(5, 19);
  if (day.length === 0) return undefined;
  let x = 0;
  let y = 0;
  for (const h of day) {
    const rad = (h.windDirection * Math.PI) / 180;
    x += Math.sin(rad) * Math.max(h.windSpeed, 0.1);
    y += Math.cos(rad) * Math.max(h.windSpeed, 0.1);
  }
  const deg = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
  return `${DIRS[Math.round(deg / 22.5) % 16]}の風`;
}

/**
 * スポット×日付の天気・風・海面水温と釣行指数。
 * 組み立ては /api/fishing-index（お気に入りの「今日の釣行指数」）と同一:
 *   満干は「フル表示スポット」だけ最寄り観測地点の気象庁データ、それ以外は潮回りのみ。
 */
export async function getFishingForecast(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  const today = todayJST();
  const date = ymd(args.date) ?? today;
  const last = addDaysYmd(today, FORECAST_DAYS - 1);
  if (date < today || date > last) {
    throw new ToolInputError(
      `date は今日（${today}）から${FORECAST_DAYS}日以内（〜${last}）で指定してください。それより先の潮回りは get_tide で確認できます`,
    );
  }

  const forecast = await fetchSpotForecast(spot.latitude, spot.longitude);
  if (!forecast || forecast.days.length === 0) {
    throw new ToolError(
      "天気予報サービスに一時的に接続できませんでした。少し時間をおいて再試行するか、潮回り・満干潮は get_tide で確認してください。",
    );
  }
  const day = forecast.days.find((d) => d.date === date);
  if (!day) {
    throw new ToolError(`${date} の予報データがまだありません。もう少し近い日付で指定してください`);
  }

  const tideCode = getTideDisplayMode(spot) === "full" ? (getTideStationForSpot(spot)?.code ?? null) : null;
  const index = calcFishingIndex(getTideInfoForDate(tideCode, day.date), day);
  const week = forecast.days.map((d) => ({
    date: d.date,
    score: calcFishingIndex(getTideInfoForDate(tideCode, d.date), d).score,
  }));

  return {
    spot: spot.name,
    date,
    weather: {
      summary: getWeatherInfo(day.weatherCode).label,
      tempMaxC: round1(day.tempMax),
      windMaxMs: round1(day.windMaxMs),
      windDirection: daytimeWindDirection(day.hourly),
      seaSurfaceTempC: day.seaTempC === null ? undefined : round1(day.seaTempC),
      sunrise: day.sunrise,
      sunset: day.sunset,
    },
    tide: {
      tideType: index.tide.tideLabel,
      moonAge: round1(index.tide.moonAge),
      highTides: index.tide.highTides,
      lowTides: index.tide.lowTides,
      note: tideCode ? undefined : "このスポットは満干時刻を表示しない種類（湖・池・河川など）のため潮回りのみ",
    },
    fishingIndex: {
      score: index.score,
      label: index.label,
      breakdown: index.breakdown.map((b) => ({ item: b.label, points: `${b.value}/${b.max}`, reason: b.reason })),
      bestTime: index.best
        ? { from: `${index.best.startHour}:00`, to: `${index.best.endHour}:00`, reason: index.best.detail }
        : undefined,
    },
    weekOutlook: week,
    source: "天気: Open-Meteo（予報）／潮: 気象庁 潮位表（推算値）／釣行指数: ツリスポ独自（潮35・マヅメ25・風20・天気15・水温5点）",
    url: siteUrl(`/spots/${spot.slug}`),
    notice: "予報は変わります。強風・高波・雷の予報がある日は釣行を中止してください。",
  };
}

// ---------------------------------------------------------------------------
// 定義
// ---------------------------------------------------------------------------

export const TIDE_TOOLS: ToolDef[] = [
  {
    name: "get_tide",
    title: "潮汐（満潮・干潮）",
    description:
      "釣り場の指定日の潮回り（大潮・小潮など）と満潮・干潮の時刻・潮位を返します（気象庁の推算値、最寄り観測地点）。" +
      "例: {\"slug\":\"daikoku-futo\",\"date\":\"2026-12-01\"}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "search_spots が返した slug" },
        date: { type: "string", description: "日付 YYYY-MM-DD（省略時は今日・日本時間）" },
      },
      required: ["slug"],
    },
    run: getTide,
  },
  {
    name: "get_fishing_forecast",
    title: "釣り予報（天気・風・釣行指数）",
    description:
      "釣り場の今日〜7日先の天気・最大風速・風向・海面水温・潮回りと、0〜100点の釣行指数（内訳つき）・おすすめ時間帯を返します。" +
      "「明日◯◯に行って釣れそう？」「今週いつ行くのがいい？」に使ってください（weekOutlook に7日分の指数）。" +
      "例: {\"slug\":\"daikoku-futo\",\"date\":\"2026-11-21\"}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "search_spots が返した slug" },
        date: { type: "string", description: "日付 YYYY-MM-DD（今日から7日以内。省略時は今日・日本時間）" },
      },
      required: ["slug"],
    },
    run: getFishingForecast,
  },
];
