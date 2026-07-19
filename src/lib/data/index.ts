import { FishSpecies, FishingSpot, SpotSummary } from "@/types";
import { fishSpecies } from "./fish";
import { fishingSpots } from "./spots";
import { prefectures } from "./prefectures";
import { MONTHS, isMonthInRange } from "./fishing-methods";
import { fishMetadata } from "./fish-metadata";

// 魚種データにスポット情報を自動付与（個別魚詳細ページ用、全件）
export function getFishSpeciesWithSpots(): FishSpecies[] {
  return fishSpecies.map((fish) => ({
    ...fish,
    spots: fishingSpots
      .filter((spot) =>
        spot.catchableFish.some((cf) => cf.fish.slug === fish.slug)
      )
      .map((spot): SpotSummary => {
        const cf = spot.catchableFish.find((cf) => cf.fish.slug === fish.slug)!;
        return {
          id: spot.id,
          name: spot.name,
          slug: spot.slug,
          region: spot.region,
          rating: spot.rating,
          catchRating: cf.peakSeason ? "excellent" : "good",
          latitude: spot.latitude,
          longitude: spot.longitude,
        };
      }),
  }));
}

// 魚種一覧ページ用（軽量版）: 各魚種にスポットは先頭3件のみ + 総数。
// 元の getFishSpeciesWithSpots は 100 魚種 × 数百スポットを HTML に埋め込み
// 5.6 MB / 1 ページの巨大 HTML を生成していたため、リスト用に分離。
export function getFishSpeciesForList(): FishSpecies[] {
  return fishSpecies.map((fish) => {
    const matching = fishingSpots.filter((spot) =>
      spot.catchableFish.some((cf) => cf.fish.slug === fish.slug)
    );
    const top3: SpotSummary[] = matching.slice(0, 3).map((spot): SpotSummary => {
      const cf = spot.catchableFish.find((cf) => cf.fish.slug === fish.slug)!;
      return {
        id: spot.id,
        name: spot.name,
        slug: spot.slug,
        region: spot.region,
        rating: spot.rating,
        catchRating: cf.peakSeason ? "excellent" : "good",
        latitude: spot.latitude,
        longitude: spot.longitude,
      };
    });
    return { ...fish, spots: top3, spotCount: matching.length };
  });
}

/**
 * 共起する魚種を取得（同じスポットで釣れる魚を集計し、頻度順に返す）
 * @param fishSlug 対象の魚種slug
 * @param limit 最大取得数（デフォルト8）
 */
export function getCoOccurringFish(
  fishSlug: string,
  limit: number = 8
): { slug: string; name: string; count: number }[] {
  // この魚が釣れるスポットを取得
  const relevantSpots = fishingSpots.filter((spot) =>
    spot.catchableFish.some((cf) => cf.fish.slug === fishSlug)
  );

  // 同じスポットに出現する他の魚種を集計
  const coOccurrenceMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const spot of relevantSpots) {
    for (const cf of spot.catchableFish) {
      if (cf.fish.slug === fishSlug) continue;
      const existing = coOccurrenceMap.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        coOccurrenceMap.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          count: 1,
        });
      }
    }
  }

  return Array.from(coOccurrenceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * 魚種名からslugを取得（都道府県ページの季節魚種リンク用）
 */
export function getFishSlugByName(name: string): string | null {
  const fish = fishSpecies.find((f) => f.name === name);
  return fish ? fish.slug : null;
}

/**
 * 同じ釣り方で釣れる魚種を取得（魚種ページの内部リンク用）
 */
export function getFishBySameMethod(
  fishSlug: string,
  limit: number = 6
): { slug: string; name: string; methods: string[] }[] {
  const targetFish = fishSpecies.find((f) => f.slug === fishSlug);
  if (!targetFish || !targetFish.fishingMethods) return [];

  const targetMethods = new Set(targetFish.fishingMethods.map((m) => m.methodName));

  return fishSpecies
    .filter((f) => f.slug !== fishSlug && f.fishingMethods && f.fishingMethods.length > 0)
    .map((f) => {
      const sharedMethods = f.fishingMethods!
        .filter((m) => targetMethods.has(m.methodName))
        .map((m) => m.methodName);
      return { slug: f.slug, name: f.name, methods: sharedMethods };
    })
    .filter((f) => f.methods.length > 0)
    .sort((a, b) => b.methods.length - a.methods.length)
    .slice(0, limit);
}

/**
 * 同じ季節に釣れる魚種を取得（魚種ページの内部リンク用）
 */
export function getFishBySameSeason(
  fishSlug: string,
  limit: number = 6
): { slug: string; name: string; overlapMonths: number }[] {
  const targetFish = fishSpecies.find((f) => f.slug === fishSlug);
  if (!targetFish) return [];

  const targetPeak = new Set(targetFish.peakMonths);

  return fishSpecies
    .filter((f) => f.slug !== fishSlug)
    .map((f) => {
      const overlap = f.peakMonths.filter((m) => targetPeak.has(m)).length;
      return { slug: f.slug, name: f.name, overlapMonths: overlap };
    })
    .filter((f) => f.overlapMonths > 0)
    .sort((a, b) => b.overlapMonths - a.overlapMonths)
    .slice(0, limit);
}

// 都道府県×魚種のスポット取得
export function getSpotsByPrefectureAndFish(prefName: string, fishSlug: string): FishingSpot[] {
  return fishingSpots.filter(s =>
    s.region.prefecture === prefName &&
    s.catchableFish.some(cf => cf.fish.slug === fishSlug)
  );
}

/**
 * 品質基準を満たす「都道府県×魚種」組み合わせを返す共有ヘルパ。
 * minSpots 件以上のスポットがある組み合わせのみ（noindex/sitemap のしきい値=3 と統一）。
 * sitemap と prefecture/[slug]/fish/[fishSlug] の generateStaticParams で共用し、
 * 「インデックス対象 = 事前生成対象」を保証する（空HTMLの尾を作らない）。
 *
 * count は**ユニークスポット数**で数える。ページ側の index 判定
 * （getSpotsByPrefectureAndFish(...).length >= 3）と同一基準にするため。
 * 旧実装は catchableFish の出現数カウントで、同一スポットが同じ魚を複数釣法で
 * 持つと水増しされ、「sitemap 掲載なのにページ側は noindex」という GSC
 * 「送信された URL に noindex タグが追加されています」の構造的発生源だった。
 */
export function getEligiblePrefFishCombos(
  minSpots: number = 3
): { prefSlug: string; fishSlug: string; count: number }[] {
  const countMap = new Map<string, number>();
  for (const spot of fishingSpots) {
    const pref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!pref) continue;
    // 同一スポット内の複数エントリ（釣法・期間違い）を 1 スポットに正規化
    const fishSlugs = new Set(spot.catchableFish.map((cf) => cf.fish.slug));
    for (const fishSlug of fishSlugs) {
      const key = `${pref.slug}|${fishSlug}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }
  }
  const combos: { prefSlug: string; fishSlug: string; count: number }[] = [];
  for (const [key, count] of countMap) {
    if (count < minSpots) continue;
    const [prefSlug, fishSlug] = key.split("|");
    combos.push({ prefSlug, fishSlug, count });
  }
  // 件数の多い順（人気組み合わせを先にプリレンダ）
  return combos.sort((a, b) => b.count - a.count);
}

/**
 * 高価値な「都道府県×月×魚種」組み合わせ（マトリクスの厳選 index 化）。
 *
 * 各組合せは以下を全て満たす（薄いページを index から除外するための足切り）:
 *   - 人気魚種: fishMetadata.popularity <= maxFishRank（1が最人気・カテゴリ別採番）
 *   - スポット数: その県・その月にその魚が釣れるスポットが minSpots 件以上（スポット単位で重複排除）
 *   - 旬: 対象スポットのいずれかで peakSeason=true（その月が実際の好機であることの裏付け）
 * さらに 2 段の上限で総数と多様性を制御する:
 *   - **魚種ごとに月数上位 perFishMonthLimit 件**（同じ魚で似たページが12ヶ月並ぶのを防ぎ、旬の月に集約）
 *   - **都道府県ごとに spot 数上位 perPrefLimit 件**（県数 × perPrefLimit ≒ 数百〜千規模に圧縮、各県の“看板ページ”だけ残す）
 *
 * matrix の generateStaticParams / generateMetadata と sitemap.ts で共用し
 * 「index対象 = 事前生成対象 = sitemap掲載」を一致させ、薄い noindex ページの大量生成を防ぐ。
 * 既定値は約750件（minSpots=5 は据え置き＝各ページの厚みは不変、幅だけ拡大）。
 * すべての index ページが「旬・人気魚種・実スポット5件以上」を満たす前提で、
 * GSC の index 数・収益を見て perPrefLimit/maxFishRank をさらに緩めて拡大する。
 */
export function getHighValuePrefMonthFishCombos(
  opts: {
    minSpots?: number;
    maxFishRank?: number;
    perPrefLimit?: number;
    perFishMonthLimit?: number;
  } = {}
): { prefSlug: string; monthSlug: string; fishSlug: string; count: number }[] {
  const minSpots = opts.minSpots ?? 5;
  const maxFishRank = opts.maxFishRank ?? 30;
  const perPrefLimit = opts.perPrefLimit ?? 16;
  const perFishMonthLimit = opts.perFishMonthLimit ?? 3;

  const combos: {
    prefSlug: string;
    monthSlug: string;
    fishSlug: string;
    count: number;
  }[] = [];

  for (const pref of prefectures) {
    const prefSpots = fishingSpots.filter(
      (s) => s.region.prefecture === pref.name
    );
    if (prefSpots.length === 0) continue;

    // この県の候補を魚種ごとに集約 → 魚種内で月を絞り → 県内で上位を絞る
    const byFish = new Map<string, { monthSlug: string; count: number }[]>();

    for (const month of MONTHS) {
      // fishSlug -> { count: ユニークスポット数, hasPeak: 旬スポットの有無 }
      const stat = new Map<string, { count: number; hasPeak: boolean }>();
      for (const spot of prefSpots) {
        // 同一スポットで同魚種が複数 method で釣れても 1 スポットとして数える
        const seen = new Map<string, boolean>(); // fishSlug -> このスポットで旬か
        for (const cf of spot.catchableFish) {
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
            seen.set(
              cf.fish.slug,
              (seen.get(cf.fish.slug) || false) || Boolean(cf.peakSeason)
            );
          }
        }
        for (const [fSlug, peak] of seen) {
          const s = stat.get(fSlug) || { count: 0, hasPeak: false };
          s.count += 1;
          s.hasPeak = s.hasPeak || peak;
          stat.set(fSlug, s);
        }
      }

      for (const [fSlug, s] of stat) {
        if (s.count < minSpots) continue;
        if (!s.hasPeak) continue;
        const rank = fishMetadata[fSlug]?.popularity;
        if (rank === undefined || rank > maxFishRank) continue;
        const arr = byFish.get(fSlug) || [];
        arr.push({ monthSlug: month.slug, count: s.count });
        byFish.set(fSlug, arr);
      }
    }

    // 魚種ごとに月をスポット数順で絞る（旬の月に集約）→ 県の候補プールへ
    const prefCandidates: {
      monthSlug: string;
      fishSlug: string;
      count: number;
    }[] = [];
    for (const [fSlug, months] of byFish) {
      months.sort((a, b) =>
        b.count !== a.count
          ? b.count - a.count
          : a.monthSlug.localeCompare(b.monthSlug)
      );
      for (const m of months.slice(0, perFishMonthLimit)) {
        prefCandidates.push({ fishSlug: fSlug, ...m });
      }
    }

    // スポット数の多い順 → 同数は人気魚種優先で決定的に並べ、県の上位だけ採用
    prefCandidates.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const ra = fishMetadata[a.fishSlug]?.popularity ?? 999;
      const rb = fishMetadata[b.fishSlug]?.popularity ?? 999;
      if (ra !== rb) return ra - rb;
      return `${a.monthSlug}/${a.fishSlug}`.localeCompare(
        `${b.monthSlug}/${b.fishSlug}`
      );
    });

    for (const c of prefCandidates.slice(0, perPrefLimit)) {
      combos.push({ prefSlug: pref.slug, ...c });
    }
  }

  // 全体をスポット数の多い順（価値の高い組み合わせを先にプリレンダ）
  return combos.sort((a, b) => b.count - a.count);
}

/**
 * index 対象の「都道府県×月×魚種」組み合わせ（= 配信される全ページ）。
 *
 * 条件は matrix ページのレンダリング判定と完全一致させる必要がある:
 *   その県・その月にその魚が釣れる**ユニークスポット数** >= minSpots
 *   （= matrix ページ本体の `matchingSpots.length >= MIN_SPOTS` と同一基準）。
 * matrix ページは count < minSpots を 301 リダイレクトし、それ以外は配信する。
 * その「配信される全ページ」を index / sitemap 掲載対象にする（薄いページも積極 index 方針）。
 *
 * 旧実装は catchableFish の出現数カウントで、同一スポットが同じ魚を複数釣法で持つと
 * 「出現数>=2 だがユニークスポット<2」の組合せが sitemap に載り、ページ側では
 * 301 される矛盾（GSC「送信された URL にリダイレクトがあります」）の構造的発生源だった。
 *
 * getHighValuePrefMonthFishCombos（高価値の厳選サブセット・元からユニークカウント）は
 * 引き続き generateStaticParams の事前生成(SSG)対象に使い、SSG 枚数=イメージ容量を抑える。
 * 索引は広いが事前生成は厳選、という非対称でロングテール index と容量を両立する。
 */
export function getEligiblePrefMonthFishCombos(
  minSpots: number = 2
): { prefSlug: string; monthSlug: string; fishSlug: string; count: number }[] {
  const out: {
    prefSlug: string;
    monthSlug: string;
    fishSlug: string;
    count: number;
  }[] = [];
  for (const pref of prefectures) {
    const prefSpots = fishingSpots.filter(
      (s) => s.region.prefecture === pref.name
    );
    if (prefSpots.length === 0) continue;
    for (const month of MONTHS) {
      const fishMap = new Map<string, number>();
      for (const spot of prefSpots) {
        // 同一スポット内の複数エントリ（釣法・期間違い）を 1 スポットに正規化
        const seen = new Set<string>();
        for (const cf of spot.catchableFish) {
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
            seen.add(cf.fish.slug);
          }
        }
        for (const fSlug of seen) {
          fishMap.set(fSlug, (fishMap.get(fSlug) || 0) + 1);
        }
      }
      for (const [fSlug, count] of fishMap) {
        if (count >= minSpots) {
          out.push({
            prefSlug: pref.slug,
            monthSlug: month.slug,
            fishSlug: fSlug,
            count,
          });
        }
      }
    }
  }
  return out;
}

// 全データのエクスポート
export { fishSpecies } from "./fish";
export { fishingSpots } from "./spots";
export { regions } from "./regions";
export { getFishBySlug, getCatchableNow, getPeakFish, getFishSeasons } from "./fish";
export { fishRegionalSeasons, REGION_NAME_TO_SLUG, REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "./fish-regional-seasons";
export { getSpotBySlug, getNearbySpots, getSpotsByPrefecture } from "./spots";
export { tackleShops, getShopBySlug, getNearbyShops, getShopsForSpot } from "./shops";
export { prefectureInfoList, getPrefectureInfoBySlug } from "./prefecture-info";
