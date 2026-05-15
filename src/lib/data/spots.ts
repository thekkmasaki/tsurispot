import { FishingSpot } from "@/types";
import { allRawSpots } from "./spots-registry";
import { spotRulesBatch } from "./spots-rules-batch";

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
  return deduped;
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

export const fishingSpots: FishingSpot[] = applyBatchRules(deduplicateSpots(allRawSpots));

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

export function getSpotsByPrefecture(prefecture: string, excludeSlug: string, limit = 6): FishingSpot[] {
  return fishingSpots
    .filter((s) => s.region.prefecture === prefecture && s.slug !== excludeSlug)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getSpotsByFish(fishSlugs: string[], excludeSlug: string, limit = 5): FishingSpot[] {
  const fishSet = new Set(fishSlugs);
  const matched: { spot: FishingSpot; matchCount: number }[] = [];
  for (const s of fishingSpots) {
    if (s.slug === excludeSlug) continue;
    let count = 0;
    for (const cf of s.catchableFish) {
      if (fishSet.has(cf.fish.slug)) count++;
    }
    if (count > 0) matched.push({ spot: s, matchCount: count });
  }
  matched.sort((a, b) => b.matchCount - a.matchCount || b.spot.rating - a.spot.rating);
  return matched.slice(0, limit).map((m) => m.spot);
}

export function getSpotsByMethod(methods: string[], excludeSlug: string, limit = 5): FishingSpot[] {
  const methodSet = new Set(methods);
  const matched: { spot: FishingSpot; matchCount: number }[] = [];
  for (const s of fishingSpots) {
    if (s.slug === excludeSlug) continue;
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
