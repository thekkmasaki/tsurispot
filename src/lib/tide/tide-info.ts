// 既存 TideInfo 契約（calculations.ts）への互換アダプタ（サーバー専用: tide-data.ts に依存）
//
// 潮回り・月齢・スコアは moon.ts（朔テーブル）、満干時刻は気象庁データ（tide-data.ts）から取得。
// 観測地点が無い（淡水）またはデータ未整備の日付では highTides/lowTides は空配列になる。
// ※ 誤差の大きかった旧近似式（月齢×0.8h）へのフォールバックは行わない。
import type { TideInfo } from "@/lib/weather/calculations";
import { getMoonAgeJST, getTideTypeFromMoonAge } from "./moon";
import { getTideDay } from "./tide-data";

/**
 * 指定地点コード・指定日（JST "YYYY-MM-DD"）の TideInfo を返す。
 * code が null（淡水スポット等）の場合は潮回りのみで満干時刻は空。
 */
export function getTideInfoForDate(code: string | null, dateStr: string): TideInfo {
  const moonAge = getMoonAgeJST(dateStr);
  const phase = getTideTypeFromMoonAge(moonAge);

  let highTides: string[] = [];
  let lowTides: string[] = [];
  if (code) {
    const day = getTideDay(code, dateStr);
    if (day) {
      highTides = day.hi.map(([t]) => t);
      lowTides = day.lo.map(([t]) => t);
    }
  }

  return {
    moonAge: phase.moonAge,
    tideType: phase.tideType,
    tideLabel: phase.tideLabel,
    fishingScore: phase.fishingScore,
    highTides,
    lowTides,
    description: phase.description,
  };
}
