import { FishingSpot } from "@/types";
import { allRawSpots } from "./spots-registry";
import { spotRulesBatch } from "./spots-rules-batch";
// next.config.ts が spots.ts を import する都合上、@/ エイリアスではなく
// 相対パスで参照する必要がある (path mapping がビルド時 transpile では効かない)。
import { generateSpotIntro } from "../utils/spot-content-generator";
import { isSameSpotName } from "./spot-name-normalize";

// 重複排除で消えたslugから勝者slugへのマップ（自動リダイレクト用）
export const dedupRedirects = new Map<string, string>();

// Deduplication: remove duplicate spots by name (and near-duplicates within ~500m)
// Keeps the entry with the most catchable fish as a proxy for data completeness.
// _baseSpots are listed first so they are preferred when catchableFish counts tie.
function deduplicateSpots(spots: FishingSpot[]): FishingSpot[] {
  const seen = new Map<string, FishingSpot>();
  for (const spot of spots) {
    const key = spot.name.trim();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, spot);
    } else {
      if (spot.catchableFish.length > existing.catchableFish.length) {
        // 既存のslugは負け → 新しいslugへリダイレクト
        dedupRedirects.set(existing.slug, spot.slug);
        seen.set(key, spot);
      } else {
        // 新しいslugは負け → 既存のslugへリダイレクト
        dedupRedirects.set(spot.slug, existing.slug);
      }
    }
  }
  const result = Array.from(seen.values());
  const coordKey = (s: FishingSpot) =>
    `${Math.round(s.latitude * 200) / 200}_${Math.round(s.longitude * 200) / 200}`;
  const coordMap = new Map<string, FishingSpot>();
  const deduped: FishingSpot[] = [];
  for (const spot of result) {
    const ck = coordKey(spot);
    const existing = coordMap.get(ck);
    if (!existing) {
      coordMap.set(ck, spot);
      deduped.push(spot);
    } else if (existing.name.trim() === spot.name.trim()) {
      if (spot.catchableFish.length > existing.catchableFish.length) {
        dedupRedirects.set(existing.slug, spot.slug);
        const idx = deduped.indexOf(existing);
        if (idx !== -1) deduped[idx] = spot;
        coordMap.set(ck, spot);
      } else {
        dedupRedirects.set(spot.slug, existing.slug);
      }
    } else {
      deduped.push(spot);
    }
  }
  // Pass3: 表記ゆれ名寄せ（2026-08 UX監査）。
  // 「本牧海づり施設 / 横浜本牧海づり施設 / 横浜・本牧海づり施設」のような
  // 同一地物の別表記が Pass1（名前完全一致）と Pass2（555mグリッド）を
  // すり抜けて別ページとして生存し、互いの「周辺スポット」に並んでいた。
  // 条件は保守的に「同一都道府県 かつ 5km以内 かつ 正規化名が同一
  // （地名プレフィックス差は吸収、接尾辞差=別地物は結合しない）」。
  const NAME_MERGE_MAX_KM = 5;
  const byPref = new Map<string, FishingSpot[]>();
  for (const spot of deduped) {
    const list = byPref.get(spot.region.prefecture);
    if (list) list.push(spot);
    else byPref.set(spot.region.prefecture, [spot]);
  }
  const removedSlugs = new Set<string>();
  for (const group of byPref.values()) {
    for (let i = 0; i < group.length; i++) {
      const a = group[i];
      if (removedSlugs.has(a.slug)) continue;
      for (let j = i + 1; j < group.length; j++) {
        const b = group[j];
        if (removedSlugs.has(b.slug)) continue;
        if (!isSameSpotName(a.name, b.name)) continue;
        if (haversineKm(a.latitude, a.longitude, b.latitude, b.longitude) > NAME_MERGE_MAX_KM) continue;
        // 勝者は既存Passと同じく catchableFish が多い方（同数なら先着）
        const [winner, loser] =
          b.catchableFish.length > a.catchableFish.length ? [b, a] : [a, b];
        dedupRedirects.set(loser.slug, winner.slug);
        removedSlugs.add(loser.slug);
        // 名寄せ結果のレビュー用（DEDUP_REPORT=1 npx vitest run ... で出力）
        if (process.env.DEDUP_REPORT === "1") {
          const km = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude).toFixed(2);
          console.log(`[dedup-pass3] ${loser.name}(${loser.slug}) -> ${winner.name}(${winner.slug}) ${km}km ${a.region.prefecture}`);
        }
        if (loser === a) break; // a が消えたら a のループを抜ける
      }
    }
  }
  const merged = removedSlugs.size > 0 ? deduped.filter((s) => !removedSlugs.has(s.slug)) : deduped;

  // チェーン解決: A→B→C の場合、A→C に修正
  for (const [loser, winner] of dedupRedirects) {
    let finalWinner = winner;
    let depth = 0;
    while (dedupRedirects.has(finalWinner) && depth < 10) {
      finalWinner = dedupRedirects.get(finalWinner)!;
      depth++;
    }
    if (finalWinner !== winner) {
      dedupRedirects.set(loser, finalWinner);
    }
  }
  return merged;
}

// ルールデータの一括適用（既にrulesが設定されているスポットは上書きしない）
function applyBatchRules(spots: FishingSpot[]): FishingSpot[] {
  return spots.map((spot) => {
    if (spot.rules) return spot; // 既にルールがある場合はスキップ
    const batchRules = spotRulesBatch[spot.slug];
    if (batchRules) {
      return { ...spot, rules: batchRules };
    }
    return spot;
  });
}

// description が薄い (<100字) スポットを generateSpotIntro で補完する。
// sitemap.ts の品質フィルタ (description>=100字) を満たすことが目的。
// 既存の 100字以上の description には触らず、人間が書いた文章を尊重する。
function enrichDescriptions(spots: FishingSpot[]): FishingSpot[] {
  return spots.map((spot) => {
    if ((spot.description || "").length >= 100) return spot;
    // 釣り禁止スポットは自動生成の対象外。generateSpotIntro() は
    // 「〜が狙える」「ベストシーズンは〜」と釣行を勧める文を組み立てるため、
    // 禁止スポットに適用すると人手で書いた禁止の説明を上書きしてしまう。
    if (spot.fishingBan) return spot;
    return { ...spot, description: generateSpotIntro(spot) };
  });
}

export const fishingSpots: FishingSpot[] = enrichDescriptions(
  applyBatchRules(deduplicateSpots(allRawSpots))
);

export function getSpotBySlug(slug: string): FishingSpot | undefined {
  return fishingSpots.find((s) => s.slug === slug);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type NearbySpot = FishingSpot & { distanceKm: number };

export function getNearbySpots(lat: number, lng: number, limit = 5): NearbySpot[] {
  // Pre-filter by bounding box (~55km per 0.5 degrees) to avoid Haversine on all spots
  const margin = Math.max(0.5, limit * 0.03); // widen box for larger limits
  const latMin = lat - margin;
  const latMax = lat + margin;
  const lngMin = lng - margin;
  const lngMax = lng + margin;

  const candidates = fishingSpots.filter(
    (s) => s.latitude >= latMin && s.latitude <= latMax && s.longitude >= lngMin && s.longitude <= lngMax
  );

  // Fallback: if bounding box yields fewer results than limit, use all spots
  const source = candidates.length >= limit ? candidates : fishingSpots;

  return source
    .map((spot) => ({
      ...spot,
      distanceKm: haversineKm(lat, lng, spot.latitude, spot.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

// excludeSlugs: 同一ページ内で既に表示したスポットの連鎖除外用（2026-08 UX監査:
// 各モジュールが rating 降順で同じ顔ぶれを返し、1ページに同一スポットが
// 最大6回重複表示されていた）。
export function getSpotsByPrefecture(prefecture: string, excludeSlug: string, limit = 6, excludeSlugs?: ReadonlySet<string>): FishingSpot[] {
  return fishingSpots
    .filter((s) => s.region.prefecture === prefecture && s.slug !== excludeSlug && !excludeSlugs?.has(s.slug))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getSpotsByFish(fishSlugs: string[], excludeSlug: string, limit = 5, excludeSlugs?: ReadonlySet<string>): FishingSpot[] {
  const fishSet = new Set(fishSlugs);
  const matched: { spot: FishingSpot; matchCount: number }[] = [];
  for (const s of fishingSpots) {
    if (s.slug === excludeSlug || excludeSlugs?.has(s.slug)) continue;
    let count = 0;
    for (const cf of s.catchableFish) {
      if (fishSet.has(cf.fish.slug)) count++;
    }
    if (count > 0) matched.push({ spot: s, matchCount: count });
  }
  matched.sort((a, b) => b.matchCount - a.matchCount || b.spot.rating - a.spot.rating);
  return matched.slice(0, limit).map((m) => m.spot);
}

export function getSpotsByMethod(methods: string[], excludeSlug: string, limit = 5, excludeSlugs?: ReadonlySet<string>): FishingSpot[] {
  const methodSet = new Set(methods);
  const matched: { spot: FishingSpot; matchCount: number }[] = [];
  for (const s of fishingSpots) {
    if (s.slug === excludeSlug || excludeSlugs?.has(s.slug)) continue;
    const seen = new Set<string>();
    let count = 0;
    for (const cf of s.catchableFish) {
      if (cf.method && methodSet.has(cf.method) && !seen.has(cf.method)) {
        seen.add(cf.method);
        count++;
      }
    }
    if (count > 0) matched.push({ spot: s, matchCount: count });
  }
  matched.sort((a, b) => b.matchCount - a.matchCount || b.spot.rating - a.spot.rating);
  return matched.slice(0, limit).map((m) => m.spot);
}

// 同じ釣り場タイプ (port, breakwater, beach 等) で同じ都道府県のスポットを返す。
// マイナースポットへの内部リンク経路を増やす目的。
export function getSpotsBySpotType(
  spotType: FishingSpot["spotType"],
  prefecture: string,
  excludeSlug: string,
  limit = 6,
  excludeSlugs?: ReadonlySet<string>
): FishingSpot[] {
  return fishingSpots
    .filter((s) => s.spotType === spotType && s.region.prefecture === prefecture && s.slug !== excludeSlug && !excludeSlugs?.has(s.slug))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// 同じ難易度・同じ都道府県のスポットを返す。
// 初心者→初心者向け、上級者→上級者向けの推薦として機能。
export function getSpotsByDifficulty(
  difficulty: FishingSpot["difficulty"],
  prefecture: string,
  excludeSlug: string,
  limit = 6,
  excludeSlugs?: ReadonlySet<string>
): FishingSpot[] {
  return fishingSpots
    .filter((s) => s.difficulty === difficulty && s.region.prefecture === prefecture && s.slug !== excludeSlug && !excludeSlugs?.has(s.slug))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
