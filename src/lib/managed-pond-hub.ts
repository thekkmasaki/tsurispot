/**
 * 管理釣り場・釣り堀ハブページ（/managed-ponds）用の集計（サーバー専用）。
 */
import { fishingSpots } from "@/lib/data/spots";
import { prefectures, type Prefecture } from "@/lib/data/prefectures";
import type { FishingSpot } from "@/types";

/** 県ページを index / sitemap に載せる最小件数。未満は noindex,follow（薄いページ防止） */
export const MIN_MANAGED_PER_PREF = 5;

export function getManagedSpots(): FishingSpot[] {
  return fishingSpots.filter((s) => s.isManagedPond);
}

export interface ManagedPrefGroup {
  pref: Prefecture;
  spots: FishingSpot[];
}

/** 件数の多い順の都道府県グループ（0件の県は含めない） */
export function getManagedByPrefecture(): ManagedPrefGroup[] {
  const map = new Map<string, FishingSpot[]>();
  for (const s of getManagedSpots()) {
    const list = map.get(s.region.prefecture) ?? [];
    list.push(s);
    map.set(s.region.prefecture, list);
  }
  const groups: ManagedPrefGroup[] = [];
  for (const pref of prefectures) {
    const spots = map.get(pref.name);
    if (spots && spots.length > 0) groups.push({ pref, spots });
  }
  return groups.sort((a, b) => b.spots.length - a.spots.length);
}

/** 魚種別の施設数（上位） */
export function topFishOf(spots: FishingSpot[], limit = 8): { slug: string; name: string; count: number }[] {
  const m = new Map<string, { slug: string; name: string; count: number }>();
  for (const s of spots) {
    const seen = new Set<string>();
    for (const cf of s.catchableFish) {
      if (seen.has(cf.fish.slug)) continue;
      seen.add(cf.fish.slug);
      const e = m.get(cf.fish.slug);
      if (e) e.count++;
      else m.set(cf.fish.slug, { slug: cf.fish.slug, name: cf.fish.name, count: 1 });
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}
