import { FishSpecies, FishingSpot, SpotSummary } from "@/types";
import { fishSpecies } from "./fish";
import { fishingSpots } from "./spots";
import { prefectures } from "./prefectures";
import { MONTHS, isMonthInRange } from "./fishing-methods";
import { fishMetadata } from "./fish-metadata";
import { getCatchAssessment, isFishListedAtSpot } from "./fish-aptitude";
import { monthlyGuides } from "./monthly-guides";
import { prefectureInfoList } from "./prefecture-info";

/**
 * 魚種×スポットの掲載可否・バッジ・並び順はすべて fish-aptitude の
 * 判定（地域適性=漁獲量/実績 + 地形適性 + 旬/出典/評価）に一元化されている。
 * catchableFish の有無だけで「釣れる」と判定してはならない
 * （生息域外のテンプレデータが一覧・sitemap に漏れる）。
 */

/** スポットが魚を持ち、かつ適性ゲートを通るか（.some()の事前判定でメモ化を汚さない） */
function isListed(spot: FishingSpot, fishSlug: string): boolean {
  return (
    spot.catchableFish.some((cf) => cf.fish.slug === fishSlug) &&
    isFishListedAtSpot(spot, fishSlug)
  );
}

/** 掲載スポットの SpotSummary（tier・並び順スコアつき） */
function toSpotSummary(spot: FishingSpot, fishSlug: string): SpotSummary {
  const assessment = getCatchAssessment(spot, fishSlug)!;
  return {
    id: spot.id,
    name: spot.name,
    slug: spot.slug,
    region: spot.region,
    rating: spot.rating,
    catchRating: assessment.tier === "excluded" ? "fair" : assessment.tier,
    catchScore: assessment.score,
    latitude: spot.latitude,
    longitude: spot.longitude,
  };
}

/** 釣れる度スコア降順 → rating降順 → slug昇順（決定的） */
function bySpotScore(a: SpotSummary, b: SpotSummary): number {
  return (
    (b.catchScore ?? 0) - (a.catchScore ?? 0) ||
    b.rating - a.rating ||
    a.slug.localeCompare(b.slug)
  );
}

// 魚種データにスポット情報を自動付与（個別魚詳細ページ用、全件・スコア順ソート済み）
export function getFishSpeciesWithSpots(): FishSpecies[] {
  return fishSpecies.map((fish) => ({
    ...fish,
    spots: fishingSpots
      .filter((spot) => isListed(spot, fish.slug))
      .map((spot) => toSpotSummary(spot, fish.slug))
      .sort(bySpotScore),
  }));
}

// 魚種一覧ページ用（軽量版）: 各魚種にスポットは上位3件のみ + 総数。
// 元の getFishSpeciesWithSpots は 100 魚種 × 数百スポットを HTML に埋め込み
// 5.6 MB / 1 ページの巨大 HTML を生成していたため、リスト用に分離。
export function getFishSpeciesForList(): FishSpecies[] {
  return fishSpecies.map((fish) => {
    const matching = fishingSpots.filter((spot) => isListed(spot, fish.slug));
    const top3: SpotSummary[] = matching
      .map((spot) => toSpotSummary(spot, fish.slug))
      .sort(bySpotScore)
      .slice(0, 3);
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
  // この魚が釣れるスポットを取得（適性ゲート適用）
  const relevantSpots = fishingSpots.filter((spot) => isListed(spot, fishSlug));

  // 同じスポットに出現する他の魚種を集計（共起側にもゲート適用）
  const coOccurrenceMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const spot of relevantSpots) {
    for (const cf of spot.catchableFish) {
      if (cf.fish.slug === fishSlug) continue;
      if (!isFishListedAtSpot(spot, cf.fish.slug)) continue;
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
 *
 * 魚種ページの見出しは「{fishingMethods[0]}で釣れる他の魚」＝主釣法を名指しするため、
 * 主釣法を実際に共有する魚を先頭に置く。共有釣法数だけで並べた旧実装では、主釣法を
 * 共有しない魚が枠の約4割を占め、見出しと中身が食い違っていた（全116魚種で実測60.8%）。
 * 同点は人気順→slug の順で決定的に並べ、外道が推薦枠の上位を占めるのを防ぐ。
 */
export function getFishBySameMethod(
  fishSlug: string,
  limit: number = 6
): { slug: string; name: string; methods: string[] }[] {
  const targetFish = fishSpecies.find((f) => f.slug === fishSlug);
  if (!targetFish || !targetFish.fishingMethods) return [];

  const targetMethods = new Set(targetFish.fishingMethods.map((m) => m.methodName));
  const primaryMethod = targetFish.fishingMethods[0]?.methodName;

  return fishSpecies
    .filter((f) => f.slug !== fishSlug && f.fishingMethods && f.fishingMethods.length > 0)
    .map((f) => {
      const sharedMethods = f.fishingMethods!
        .filter((m) => targetMethods.has(m.methodName))
        .map((m) => m.methodName);
      return { slug: f.slug, name: f.name, methods: sharedMethods };
    })
    .filter((f) => f.methods.length > 0)
    .sort((a, b) => {
      const aPrimary = primaryMethod && a.methods.includes(primaryMethod) ? 1 : 0;
      const bPrimary = primaryMethod && b.methods.includes(primaryMethod) ? 1 : 0;
      if (aPrimary !== bPrimary) return bPrimary - aPrimary;
      if (b.methods.length !== a.methods.length) return b.methods.length - a.methods.length;
      const aRank = fishMetadata[a.slug]?.popularity ?? 999;
      const bRank = fishMetadata[b.slug]?.popularity ?? 999;
      if (aRank !== bRank) return aRank - bRank;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
}

/**
 * 同じ季節に釣れる魚種を取得（魚種ページの内部リンク用）
 *
 * 重複月数の生の多さで並べると、旬が年間8ヶ月に及ぶ魚（キス等）が全魚種ページの上位に
 * 居座り、116ページ×6枠のリンクが74種にしか向かわず42種が被リンク0だった。旬の重なり度
 * （重複月数 ÷ 和集合の月数）で並べると旬の幅が近い魚どうしが結びつき、平均重複月数を
 * 落とさずに（実測 3.42→3.40ヶ月）リンク先が94種へ広がり被リンク0が22種まで減る。
 * 同点は人気順→slug の順で決定的に並べる。
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
      const peak = new Set(f.peakMonths);
      let overlap = 0;
      for (const m of peak) {
        if (targetPeak.has(m)) overlap++;
      }
      const union = targetPeak.size + peak.size - overlap;
      return {
        slug: f.slug,
        name: f.name,
        overlapMonths: overlap,
        seasonSimilarity: union > 0 ? overlap / union : 0,
      };
    })
    .filter((f) => f.overlapMonths > 0)
    .sort((a, b) => {
      if (b.seasonSimilarity !== a.seasonSimilarity) return b.seasonSimilarity - a.seasonSimilarity;
      const aRank = fishMetadata[a.slug]?.popularity ?? 999;
      const bRank = fishMetadata[b.slug]?.popularity ?? 999;
      if (aRank !== bRank) return aRank - bRank;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, limit)
    .map((f) => ({ slug: f.slug, name: f.name, overlapMonths: f.overlapMonths }));
}

// 都道府県×魚種のスポット取得（適性ゲート適用。県×魚種ページの301判定と共用）
export function getSpotsByPrefectureAndFish(prefName: string, fishSlug: string): FishingSpot[] {
  return fishingSpots.filter(
    (s) => s.region.prefecture === prefName && isListed(s, fishSlug)
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
      if (!isFishListedAtSpot(spot, fishSlug)) continue; // 適性ゲート
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
          if (!isFishListedAtSpot(spot, cf.fish.slug)) continue; // 適性ゲート
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
 * マトリクス（都道府県×月×魚種）ページの配信下限ユニークスポット数。
 * matrix ページ本体の 301 判定・sitemap 掲載判定・各テンプレからの
 * 内部リンク適格判定で共用する（値がドリフトすると「301 先へのリンク」や
 * 「sitemap 掲載なのに 301」が再発するため、必ずこの定数を参照すること）。
 */
export const MATRIX_MIN_SPOTS = 2;

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
  minSpots: number = MATRIX_MIN_SPOTS
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
          if (!isFishListedAtSpot(spot, cf.fish.slug)) continue; // 適性ゲート
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

// =============================================================================
// マトリクス（県×月×魚種）の需要ベース index 判定
// =============================================================================

/**
 * 魚種名（和名・別名）→ slug 群に解決する（prefecture-info の popularFish / seasonalFish 用）。
 *
 * 解決順: 1) fishSpecies.name の完全一致 → 2) fishMetadata.aliases の一致（複数魚種が同じ
 * 別名を持つ場合は全件。例「ハマチ」= buri/inada） → 3) 総称の手動マップ（「青物」「イカ」）。
 * 解決できない名前（サケ・ドンコ等、魚種データに無い種）は空配列。
 *
 * getFishSlugByName（UI の単一リンク用・名前一致のみ）とは別物。需要判定では
 * 「県が看板に掲げている魚」を取り漏らさないことが目的なので、別名・総称まで広げる。
 */
const GENERIC_FISH_NAME_MAP: Record<string, readonly string[]> = {
  青物: ["buri", "inada", "kanpachi", "hiramasa"],
  イカ: ["aoriika", "yariika", "surumeika"],
};

let fishNameIndex: { byName: Map<string, string>; byAlias: Map<string, string[]> } | null = null;
function getFishNameIndex() {
  if (fishNameIndex) return fishNameIndex;
  const byName = new Map<string, string>();
  const byAlias = new Map<string, string[]>();
  for (const f of fishSpecies) {
    if (!byName.has(f.name)) byName.set(f.name, f.slug);
    for (const a of fishMetadata[f.slug]?.aliases ?? []) {
      const arr = byAlias.get(a) ?? [];
      if (!arr.includes(f.slug)) arr.push(f.slug);
      byAlias.set(a, arr);
    }
  }
  fishNameIndex = { byName, byAlias };
  return fishNameIndex;
}

export function resolveFishSlugsByName(name: string): string[] {
  const { byName, byAlias } = getFishNameIndex();
  const exact = byName.get(name);
  if (exact) return [exact];
  const aliased = byAlias.get(name);
  if (aliased && aliased.length > 0) return [...aliased];
  return [...(GENERIC_FISH_NAME_MAP[name] ?? [])];
}

/**
 * 需要判定 C の初期値（2026-08 試算時の海水・汽水 popularity 上限）。本番値は MATRIX_DEMAND_RULE を見る。
 * @deprecated MATRIX_DEMAND_RULE.seaPopularityMax を使う
 */
export const MATRIX_DEMAND_POPULARITY_MAX = 30;

/** 需要判定 D: ウナギの夏（土用の丑の検索需要）ホワイトリスト */
export const UNAGI_SUMMER_MONTH_SLUGS: readonly string[] = ["june", "july", "august"];

/** prefecture-info.seasonalFish の季節 → 月 slug */
const SEASON_MONTH_SLUGS: Record<"spring" | "summer" | "autumn" | "winter", readonly string[]> = {
  spring: ["march", "april", "may"],
  summer: ["june", "july", "august"],
  autumn: ["september", "october", "november"],
  winter: ["december", "january", "february"],
};

export type MatrixDemandReason =
  | "ssg" // 事前生成(SSG)セットに含まれる
  | "monthly-top-fish" // A: その月（±topFishAdjacentMonths）の monthlyGuides.topFish
  | "sea-popular" // C: 海水/汽水魚で popularity <= seaPopularityMax
  | "freshwater-popular" // C': 淡水魚で popularity <= freshwaterPopularityMax
  | "pref-info" // B: prefecture-info の popularFish / seasonalFish（名前一致）
  | "pref-info-alias" // B': 同上を別名・総称で解決
  | "unagi-summer"; // D: ウナギ×6〜8月

/**
 * 需要判定ルールのパラメータ。本番値は MATRIX_DEMAND_RULE。
 * 監査スクリプト（scripts/seo/matrix-index-audit.mjs --gsc）が GSC 実測に対して候補ルールを
 * 同じコードで試算できるよう、判定本体は rule を引数に取る形にしてある。
 * **GSC の行そのものをホワイトリスト化してはならない**（ドリフトするため、ルールは魚種属性ベース）。
 */
export type MatrixDemandRule = {
  /** C: 海水・汽水魚の popularity 上限（カテゴリ別採番・1 が最人気） */
  seaPopularityMax: number;
  /** C': 淡水魚の popularity 上限（0 で淡水魚を C' では拾わない） */
  freshwaterPopularityMax: number;
  /** B: seasonalFish を当季 3 ヶ月に限定（false）/ 通年扱い（true） */
  seasonalFishAllYear: boolean;
  /** A: topFish を当月だけ（0）/ 前後 N ヶ月も含める（1 なら 3 ヶ月窓） */
  topFishAdjacentMonths: 0 | 1 | 2;
};

/**
 * 本番の需要判定ルール（2026-10-21 GSC 12 週実測 7/24〜10/18・9,783 クリックで調整）。
 *
 * 8 月時点の「淡水魚は需要ゼロ」は誤りだった。GSC 12 週では淡水魚はどの人気帯でも
 * 0.5〜1.0 クリック/ページ（アユ 257・オイカワ 161・ヤマメ 122・バス 110・ヘラブナ 110・
 * タナゴ 95 クリック…）あり、淡水を 1 帯でも落とすと損失が 2% を超える。
 *
 * 海水の人気帯別クリック密度: ≤30 1.37/ページ、31〜40 0.73、41〜60 0.62、>60 0.25。
 * index を維持する淡水 6〜12 帯（0.50/ページ）より 41〜60 帯の方が需要が高いので、
 * 一貫した「需要ゼロ」の線は **海水 popularity>60**（ボラ・キビレ・フグ・ハオコゼ・アカエイ・
 * アイゴ・タマン等）に置く。海水 40 で切るとワタリガニ（pop43・10.6 クリック/ページ）等を落とす。
 *
 * 採用値の実測: 配信 8,850 → index 8,633 / noindex 217 / 失うクリック 49（0.5%）・表示 445（0.4%）。
 * 試算は `node scripts/seo/matrix-index-audit.mjs --gsc tmp/gsc-matrix-12w.json`。
 * freshwaterPopularityMax=26 は淡水魚の popularity 最大値（= メタデータを持つ淡水魚は全て需要あり）。
 */
export const MATRIX_DEMAND_RULE: MatrixDemandRule = {
  seaPopularityMax: 60,
  freshwaterPopularityMax: 26,
  seasonalFishAllYear: false,
  topFishAdjacentMonths: 0,
};

type DemandIndex = {
  ssgKeys: Set<string>;
  topFishByMonth: Map<string, Set<string>>;
  seaPopular: Set<string>;
  freshwaterPopular: Set<string>;
  /** `${prefSlug}|${fishSlug}` → 需要がある月 slug 群（"*" = 全月） */
  prefInfoByName: Map<string, Set<string>>;
  prefInfoByAlias: Map<string, Set<string>>;
};

const demandIndexCache = new Map<string, DemandIndex>();
function getDemandIndex(rule: MatrixDemandRule): DemandIndex {
  const cacheKey = JSON.stringify(rule);
  const cached = demandIndexCache.get(cacheKey);
  if (cached) return cached;

  const ssgKeys = new Set(
    getHighValuePrefMonthFishCombos().map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
  );

  // A: 月 → topFish。topFishAdjacentMonths>0 なら前後の月の topFish も当月に合算（12 月⇄1 月は循環）
  const topFishByMonth = new Map<string, Set<string>>();
  const guideByNum = new Map(monthlyGuides.map((g) => [g.month, g]));
  for (const g of monthlyGuides) {
    const set = new Set(g.topFish);
    for (let d = 1; d <= rule.topFishAdjacentMonths; d++) {
      for (const delta of [-d, d]) {
        const n = ((g.month - 1 + delta + 12) % 12) + 1;
        for (const s of guideByNum.get(n)?.topFish ?? []) set.add(s);
      }
    }
    topFishByMonth.set(g.slug, set);
  }

  const seaPopular = new Set<string>();
  const freshwaterPopular = new Set<string>();
  for (const f of fishSpecies) {
    const rank = fishMetadata[f.slug]?.popularity;
    if (rank === undefined) continue;
    if (f.category === "freshwater") {
      if (rank <= rule.freshwaterPopularityMax) freshwaterPopular.add(f.slug);
    } else if (rank <= rule.seaPopularityMax) {
      seaPopular.add(f.slug);
    }
  }

  const prefInfoByName = new Map<string, Set<string>>();
  const prefInfoByAlias = new Map<string, Set<string>>();
  const { byName } = getFishNameIndex();
  const add = (prefSlug: string, name: string, months: readonly string[]) => {
    const slugs = resolveFishSlugsByName(name);
    if (slugs.length === 0) return;
    const target = byName.has(name) ? prefInfoByName : prefInfoByAlias;
    for (const fSlug of slugs) {
      const key = `${prefSlug}|${fSlug}`;
      const set = target.get(key) ?? new Set<string>();
      for (const m of months) set.add(m);
      target.set(key, set);
    }
  };
  for (const info of prefectureInfoList) {
    for (const name of info.popularFish) add(info.slug, name, ["*"]);
    for (const season of Object.keys(SEASON_MONTH_SLUGS) as (keyof typeof SEASON_MONTH_SLUGS)[]) {
      for (const name of info.seasonalFish?.[season] ?? []) {
        add(info.slug, name, rule.seasonalFishAllYear ? ["*"] : SEASON_MONTH_SLUGS[season]);
      }
    }
  }

  const idx = { ssgKeys, topFishByMonth, seaPopular, freshwaterPopular, prefInfoByName, prefInfoByAlias };
  demandIndexCache.set(cacheKey, idx);
  return idx;
}

/**
 * 指定ルールでの需要理由（監査スクリプトの候補ルール試算用）。本番は explainPrefMonthFishDemand。
 */
export function explainPrefMonthFishDemandWith(
  rule: MatrixDemandRule,
  prefSlug: string,
  monthSlug: string,
  fishSlug: string
): MatrixDemandReason[] {
  const idx = getDemandIndex(rule);
  const reasons: MatrixDemandReason[] = [];
  if (idx.ssgKeys.has(`${prefSlug}/${monthSlug}/${fishSlug}`)) reasons.push("ssg");
  if (idx.topFishByMonth.get(monthSlug)?.has(fishSlug)) reasons.push("monthly-top-fish");
  if (idx.seaPopular.has(fishSlug)) reasons.push("sea-popular");
  if (idx.freshwaterPopular.has(fishSlug)) reasons.push("freshwater-popular");
  const key = `${prefSlug}|${fishSlug}`;
  const byName = idx.prefInfoByName.get(key);
  if (byName && (byName.has("*") || byName.has(monthSlug))) reasons.push("pref-info");
  const byAlias = idx.prefInfoByAlias.get(key);
  if (byAlias && (byAlias.has("*") || byAlias.has(monthSlug))) reasons.push("pref-info-alias");
  if (fishSlug === "unagi" && UNAGI_SUMMER_MONTH_SLUGS.includes(monthSlug)) reasons.push("unagi-summer");
  return reasons;
}

/**
 * マトリクス（県×月×魚種）ページに検索需要があるか＝index 対象とみなす理由の一覧（本番ルール）。
 * 空配列なら需要なし（noindex,follow）。isDemandPrefMonthFish の内訳説明・監査スクリプト・テスト用。
 */
export function explainPrefMonthFishDemand(
  prefSlug: string,
  monthSlug: string,
  fishSlug: string
): MatrixDemandReason[] {
  return explainPrefMonthFishDemandWith(MATRIX_DEMAND_RULE, prefSlug, monthSlug, fishSlug);
}

/**
 * マトリクス（県×月×魚種）ページの**需要判定**（純関数・決定的）。
 *
 * 「配信される全ページ（count>=MATRIX_MIN_SPOTS）」のうち、以下のいずれか（OR）を
 * 満たすものだけを index・sitemap 掲載・内部リンクの対象にする（パラメータは MATRIX_DEMAND_RULE）:
 *   - SSG: getHighValuePrefMonthFishCombos()（事前生成セット）に含まれる
 *   - A: その月の monthlyGuides.topFish に含まれる魚
 *   - B: その県の prefecture-info（popularFish=全月 / seasonalFish=当季）に挙がる魚（別名・総称で解決）
 *   - C: 海水・汽水魚で popularity <= seaPopularityMax
 *   - C': 淡水魚で popularity <= freshwaterPopularityMax
 *   - D: ウナギ × 6〜8月（土用の丑の季節需要）
 * 需要なしとなるのは実質「海水 popularity>60 の外道（ボラ・キビレ・フグ・ハオコゼ・アカエイ等）× それを
 * 看板にしていない県」で、GSC 12 週実測で 0.25 クリック/ページの帯（MATRIX_DEMAND_RULE 参照）。
 *
 * **robots（generateMetadata の index/noindex）・sitemap・内部リンク（fish→matrix、
 * 県×月→matrix、県×魚→matrix、/monthly→matrix）は必ずこの関数で駆動すること。**
 * 判定が分散すると「sitemap 掲載なのに noindex」「noindex ページへの大量リンク」が再発する
 * （seo-matrix-indexability.test.ts がドリフトを検出する）。
 *
 * これは需要の有無だけを判定する。ページが配信されるか（スポット数）は別軸なので、
 * sitemap/内部リンクには getIndexablePrefMonthFishCombos()（配信 ∧ 需要）を使う。
 * 事前生成(SSG)の範囲は従来どおり getHighValuePrefMonthFishCombos() で固定（容量不変）。
 */
export function isDemandPrefMonthFish(
  prefSlug: string,
  monthSlug: string,
  fishSlug: string
): boolean {
  return explainPrefMonthFishDemand(prefSlug, monthSlug, fishSlug).length > 0;
}

let indexableCombosCache:
  | { prefSlug: string; monthSlug: string; fishSlug: string; count: number }[]
  | null = null;

/**
 * index・sitemap 掲載対象の「県×月×魚種」= 配信される組合せ（count>=MATRIX_MIN_SPOTS）∧ 需要あり。
 * sitemap.ts と各テンプレの内部リンク生成で共用する（メモ化・決定的）。
 */
export function getIndexablePrefMonthFishCombos(): {
  prefSlug: string;
  monthSlug: string;
  fishSlug: string;
  count: number;
}[] {
  if (indexableCombosCache) return indexableCombosCache;
  indexableCombosCache = getEligiblePrefMonthFishCombos().filter((c) =>
    isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug)
  );
  return indexableCombosCache;
}

// 釣れる度ゲート（県×魚種/マトリクスページの掲載判定・テストで共用）
export { isFishListedAtSpot, getCatchTier, getCatchScore, hasRegionalAptitude } from "./fish-aptitude";

// 全データのエクスポート
export { fishSpecies } from "./fish";
export { fishingSpots } from "./spots";
export { regions } from "./regions";
export { getFishBySlug, getCatchableNow, getPeakFish, getFishSeasons } from "./fish";
export { fishRegionalSeasons, REGION_NAME_TO_SLUG, REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "./fish-regional-seasons";
export { getSpotBySlug, getNearbySpots, getSpotsByPrefecture } from "./spots";
export { tackleShops, getShopBySlug, getNearbyShops, getShopsForSpot } from "./shops";
export { prefectureInfoList, getPrefectureInfoBySlug } from "./prefecture-info";
