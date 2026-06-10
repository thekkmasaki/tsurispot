/**
 * catch-feedback.ts
 *
 * 釣果フィードバック（特許請求項11-13のMVP）。
 * スポット単位の実釣果報告を魚名別に集計し、魚種推定の
 * adjustedProbability へのブースト入力（catchCounts）を作る。
 *
 * 粒度はスポット×魚種。報告フォームにゾーン入力がないため、
 * ゾーン別の釣果反映は将来課題（フォーム拡張が必要）。
 */

import type { CatchReport } from "@/lib/data/catch-reports";
import { normalizeFishName } from "./fish-estimation";

/**
 * 釣果報告を魚名別にカウントする。
 * 1報告に複数魚名が「、」「・」等で連結されている場合は分割して各魚にカウント。
 */
export function aggregateCatchCounts(
  reports: CatchReport[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    if (!r.fishName) continue;
    for (const raw of r.fishName.split(/[、,・/／]/)) {
      const name = normalizeFishName(raw);
      if (!name) continue;
      counts[name] = (counts[name] ?? 0) + 1;
    }
  }
  return counts;
}
