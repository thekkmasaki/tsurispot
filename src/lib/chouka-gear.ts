/**
 * 釣果週報の「釣り方」列から、今週実際に釣れている釣り方を集計し、
 * その釣り方・魚種に合う商品だけを選ぶ（/chouka/* の道具提案枠）。
 *
 * スポット詳細の装備枠（getRelevantAffiliateProducts）は高単価・編集部おすすめの
 * ボーナスで文脈と無関係な商品も上位に来るが、ここは「今週この釣り方で釣れている」が
 * 見出しなので、釣り方か魚種が実際に一致した商品しか出さない（汎用品の穴埋めはしない）。
 */
import { getRelevantAffiliateProducts, type AffiliateProduct } from "@/lib/data/affiliate-products";

export interface MethodCount {
  label: string;
  count: number;
}

/** 週報の釣り方セル（例: "エギング・ヤエン"）を個々の釣り方に分ける */
export function splitMethods(cell: string): string[] {
  return cell
    .split(/[・、,，/／]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "—" && s !== "-" && s !== "不明");
}

/** 釣り方ごとの報告件数（1行に同じ釣り方が重複しても1件）。件数の多い順・同数は初出順 */
export function tallyMethods(rows: { method: string }[]): MethodCount[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const m of new Set(splitMethods(r.method))) {
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
  }
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function matchesContext(p: AffiliateProduct, methods: string[], fishNames: string[]): boolean {
  const methodHit = p.methodKeywords.some((k) => methods.some((m) => m.includes(k)));
  const fishHit = (p.fishKeywords ?? []).some((k) => fishNames.some((f) => f.includes(k) || k.includes(f)));
  return methodHit || fishHit;
}

/** 今週の釣り方・魚種に一致した商品だけを、既存のスコア順で最大 max 件 */
export function pickChoukaGear(params: {
  methods: string[];
  fishNames: string[];
  month: number;
  max?: number;
}): AffiliateProduct[] {
  const { methods, fishNames, month, max = 4 } = params;
  if (methods.length === 0 && fishNames.length === 0) return [];
  const ranked = getRelevantAffiliateProducts(methods, month, 100, false, undefined, fishNames);
  return ranked.filter((p) => matchesContext(p, methods, fishNames)).slice(0, max);
}
