// 気象庁 潮位表データ（public/tide-data/{year}/{CODE}.json）のサーバー側ローダー
//
// ※ サーバー専用（fs使用）。クライアントコンポーネントから import しないこと。
//    クライアントは /api/tide/[code] 経由で取得する。
// データ生成: node scripts/build-tide-data.mjs --year <year>
// 出典: 気象庁 潮位表（天文潮推算値）
import fs from "fs";
import path from "path";

export interface TideDay {
  /** 満潮 [["HH:MM", 潮位cm], ...]（最大4件、時刻昇順） */
  hi: [string, number][];
  /** 干潮 [["HH:MM", 潮位cm], ...] */
  lo: [string, number][];
  /** 毎時潮位cm 24件（--with-hourly 生成時のみ） */
  hourly?: number[];
}

export interface StationYearData {
  code: string;
  name: string;
  year: number;
  lat: number;
  lng: number;
  days: Record<string, TideDay>;
}

const DATA_DIR = path.join(process.cwd(), "public", "tide-data");

// ビルド/プロセス内キャッシュ（地点×年ごとに1回だけfs読み）
const cache = new Map<string, StationYearData | null>();

function loadStationYear(code: string, year: string): StationYearData | null {
  const key = `${year}/${code}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const file = path.join(DATA_DIR, year, `${code}.json`);
  let data: StationYearData | null = null;
  try {
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, "utf-8")) as StationYearData;
    }
  } catch {
    data = null;
  }
  cache.set(key, data);
  return data;
}

/** データが存在する年ディレクトリの一覧（昇順） */
export function getAvailableYears(): string[] {
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((d) => /^\d{4}$/.test(d))
      .sort();
  } catch {
    return [];
  }
}

/**
 * 指定地点・指定日（JST "YYYY-MM-DD"）の満干データを返す。
 * データ未整備の日付（翌年分未取込など）は null。
 */
export function getTideDay(code: string, dateStr: string): TideDay | null {
  const year = dateStr.slice(0, 4);
  const data = loadStationYear(code, year);
  return data?.days[dateStr] ?? null;
}

/**
 * 指定地点の全年データをマージして返す（/api/tide/[code] 用）。
 * days は存在する全年分を1つのオブジェクトに統合する。
 */
export function getStationMergedData(code: string): StationYearData | null {
  let merged: StationYearData | null = null;
  for (const year of getAvailableYears()) {
    const data = loadStationYear(code, year);
    if (!data) continue;
    if (!merged) {
      merged = { ...data, days: { ...data.days } };
    } else {
      Object.assign(merged.days, data.days);
      merged.year = data.year;
    }
  }
  return merged;
}
