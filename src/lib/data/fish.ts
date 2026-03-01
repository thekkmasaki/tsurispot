import type { FishSpecies } from "@/types";
import { seaFish } from "./fish-sea";
import { freshwaterFish } from "./fish-freshwater";
import { brackishFish } from "./fish-brackish";
import { fishMetadata } from "./fish-metadata";

// メタデータ（aliases, popularity）をマージ
function applyMetadata(list: FishSpecies[]): FishSpecies[] {
  return list.map((f) => {
    const meta = fishMetadata[f.slug];
    if (!meta) return f;
    return {
      ...f,
      aliases: meta.aliases,
      popularity: meta.popularity,
    };
  });
}

// slug重複を排除（先に定義されたほうを優先）
function dedup(list: FishSpecies[]): FishSpecies[] {
  const seen = new Set<string>();
  return list.filter((f) => {
    if (seen.has(f.slug)) return false;
    seen.add(f.slug);
    return true;
  });
}

// 人気順ソート（popularity が小さい順、未設定は末尾）
function sortByPopularity(list: FishSpecies[]): FishSpecies[] {
  return [...list].sort(
    (a, b) => (a.popularity ?? 999) - (b.popularity ?? 999)
  );
}

export const fishSpecies: FishSpecies[] = sortByPopularity(
  dedup(applyMetadata([...seaFish, ...freshwaterFish, ...brackishFish]))
);

export function getFishBySlug(slug: string): FishSpecies | undefined {
  return fishSpecies.find((f) => f.slug === slug);
}

export function getCatchableNow(month: number): FishSpecies[] {
  return fishSpecies.filter((f) => f.seasonMonths.includes(month));
}

export function getPeakFish(month: number): FishSpecies[] {
  return fishSpecies.filter((f) => f.peakMonths.includes(month));
}
