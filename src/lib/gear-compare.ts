import type { GearModel, RakutenItem } from "@/lib/data/gear-compare/types";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";

export interface CompareFilter {
  /** 使いたいジグの重さ（g）。この重さを投げられる機種だけ */
  jigG?: number | null;
  /** 予算（円）。楽天の取得価格、無ければメーカー希望価格で判定 */
  budgetYen?: number | null;
}

export type CompareSort = "price" | "lureMax" | "length" | "weight";

/** 比較・絞り込みに使う価格: 楽天の取得価格 → メーカー希望価格（税抜）の順 */
export function effectivePrice(model: GearModel, item?: RakutenItem): number | null {
  return item?.price ?? model.priceYen ?? null;
}

export function filterModels(
  models: GearModel[],
  items: Record<string, RakutenItem>,
  f: CompareFilter,
): GearModel[] {
  return models.filter((m) => {
    if (f.jigG != null) {
      const max = m.jigMaxG ?? m.lureMaxG;
      if (max == null || max < f.jigG) return false;
      if (m.lureMinG != null && m.lureMinG > f.jigG) return false;
    }
    if (f.budgetYen != null) {
      const p = effectivePrice(m, items[m.id]);
      if (p == null || p > f.budgetYen) return false;
    }
    return true;
  });
}

/** 値が無い機種は常に末尾。price/weight は昇順、lureMax/length は降順 */
export function sortModels(
  models: GearModel[],
  items: Record<string, RakutenItem>,
  sort: CompareSort,
): GearModel[] {
  const key = (m: GearModel): number | null => {
    switch (sort) {
      case "price":
        return effectivePrice(m, items[m.id]);
      case "lureMax":
        return m.jigMaxG ?? m.lureMaxG;
      case "length":
        return m.lengthM;
      case "weight":
        return m.weightG;
    }
  };
  const desc = sort === "lureMax" || sort === "length";
  return [...models].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka == null && kb == null) return 0;
    if (ka == null) return 1;
    if (kb == null) return -1;
    return desc ? kb - ka : ka - kb;
  });
}

/** 購入リンク: 楽天は取得済みならその商品、未取得なら検索。Amazonは検索（ASIN管理をしない） */
export function buyLinks(model: GearModel, item?: RakutenItem): { rakuten: string; amazon: string } {
  const q = `${model.maker} ${model.series} ${model.model}`;
  return {
    rakuten: item?.affiliateUrl ?? getRakutenUrl(q),
    amazon: getAmazonUrl(q),
  };
}

export function formatRange(min: number | null, max: number | null, unit: string): string {
  if (min == null && max == null) return "—";
  if (min == null) return `MAX ${max}${unit}`;
  if (max == null) return `${min}${unit}〜`;
  return min === max ? `${min}${unit}` : `${min}〜${max}${unit}`;
}
