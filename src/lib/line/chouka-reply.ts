/**
 * LINE「釣果」返信の本文。主要10エリアの最新週報から、好調なエリアの上位を出して /chouka へ誘導する。
 * 一斉配信（友だち数×1通で無料枠を超える）の代わりに、聞かれたときだけ返す（返信は配信数に数えない）。
 */
import type { LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";

const SITE = "https://tsurispot.com";
const UTM = "utm_source=line&utm_medium=reply&utm_campaign=chouka";
export const CHOUKA_URL = `${SITE}/chouka?${UTM}`;
const MAX_AREAS = 3;

/** 1エリア1行（そのエリアで一番好調な行）。好調度の高い順に最大3エリア */
export function pickLineHighlights(rows: LatestWeeklyCatch[]): LatestWeeklyCatch[] {
  const best = new Map<string, LatestWeeklyCatch>();
  for (const r of rows) {
    if (r.heat <= 0) continue;
    const cur = best.get(r.areaSlug);
    if (!cur || r.heat > cur.heat) best.set(r.areaSlug, r);
  }
  return [...best.values()]
    .sort((a, b) => b.heat - a.heat || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_AREAS);
}

export function buildChoukaReplyText(rows: LatestWeeklyCatch[]): string {
  const picks = pickLineHighlights(rows);
  const head = ["━━━━━━━━━━━━━━", "📊 今週の釣果ピックアップ", "━━━━━━━━━━━━━━"];
  if (picks.length === 0) {
    return [...head, "", "全国10エリアの最新釣果を", "毎週まとめています！", "", "▼ エリア別の最新釣果", CHOUKA_URL].join("\n");
  }
  const body = picks.flatMap((r) => {
    const size = r.size && r.size !== "—" ? ` ${r.size}` : "";
    return [`${"🔥".repeat(Math.min(r.heat, 3))} ${r.areaLabel}`, `　${r.fish}${size}（${r.spot}）`];
  });
  return [...head, "", ...body, "", "▼ ほかのエリア・魚の最新釣果", CHOUKA_URL].join("\n");
}
