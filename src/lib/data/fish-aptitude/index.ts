import type { FishingSpot, FishSpecies, RegionSlug } from "@/types";
import {
  resolveSeaLabel,
  BROAD_SEA_OF,
  type SeaLabel,
  type BroadSeaLabel,
} from "@/lib/geo/sea-label";
import { prefectures } from "../prefectures";
import { fishSpecies } from "../fish";
import { fishRegionalAptitude } from "./regional";
import { getSpotTypeAptitude } from "./spot-type-aptitude";
import type { AptitudeLevel, CatchTier, FishRegionalAptitude } from "./types";

export type { AptitudeLevel, CatchTier, FishRegionalAptitude } from "./types";
export { fishRegionalAptitude } from "./regional";
export { spotTypeOverrides, getSpotTypeAptitude } from "./spot-type-aptitude";

/**
 * 魚種×スポットの「釣れる度」判定。
 *
 * 魚種ページの一覧・バッジ・並び順・件数、県×魚種/マトリクスページの
 * 掲載判定・sitemap の全経路がこのモジュールの getCatchTier() を参照する
 * （「表示 = 件数 = sitemap = 301判定」の一貫性を構造的に保証するため、
 * catchableFish を直接 .some() で判定する実装を新設しないこと）。
 *
 * スコア式（0〜100）:
 *   地域適性×12 (0-48)  ← 支配項: 漁獲量統計・釣り実績
 * + 地形適性×6  (0-24)  ← spotType との適合
 * + 旬 8 / 出典 8       ← 補助シグナル（テンプレ汚染のため意図的に弱く）
 * + rating×2.4 (0-12)   ← タイブレーク級
 *
 * 地域適性が未定義の魚種は従来ロジック（peakSeasonのみ）にフォールバックし、
 * 表示・並び順が一切変わらない（適性データの段階投入を可能にする）。
 *
 * 全判定は spot.id×fishSlug 単位で遅延メモ化され、実在する組み合わせ
 * （catchableFish 総数 ≈ 2.2万件）ぶんしか計算されない。
 */

/** 「釣れる度」の内部評価 */
export interface CatchAssessment {
  tier: CatchTier;
  /** 並び順用スコア。適性未定義魚種は従来の rating+(旬?2:1) をそのまま返す */
  score: number;
}

// ── 事前構築ルックアップ（すべてO(1)参照） ──────────────

const REGION_GROUP_TO_SLUG: Record<string, RegionSlug> = {
  北海道: "hokkaido",
  東北: "tohoku",
  関東: "kanto",
  中部: "chubu",
  近畿: "kinki",
  中国: "chugoku",
  四国: "shikoku",
  "九州・沖縄": "kyushu",
};

const prefByName = new Map<string, { slug: string; regionSlug: RegionSlug | undefined }>(
  prefectures.map((p) => [
    p.name,
    { slug: p.slug, regionSlug: REGION_GROUP_TO_SLUG[p.regionGroup] },
  ])
);

const categoryBySlug = new Map<string, FishSpecies["category"]>(
  fishSpecies.map((f) => [f.slug, f.category])
);

/** スポットごとの海域ラベル（1スポット1回だけ計算） */
const seaLabelBySpotId = new Map<string, SeaLabel>();
function seaLabelOf(spot: FishingSpot): SeaLabel {
  let label = seaLabelBySpotId.get(spot.id);
  if (!label) {
    label = resolveSeaLabel(spot.latitude, spot.longitude);
    seaLabelBySpotId.set(spot.id, label);
  }
  return label;
}

// ── 地域適性の解決 ──────────────────────────────────
// 優先順位: 湾・灘の狭域指定 → 県（海域分解つき） → 大分類海域 → 8地域 → default。
// 湾は県より地理的に狭いため県指定より優先する（例: アオリイカの東京湾=1 は
// 神奈川=3 より優先され、同じ神奈川でも相模湾側は県値3が生きる）。
function resolveRegionalLevel(spot: FishingSpot, apt: FishRegionalAptitude): AptitudeLevel {
  const label = seaLabelOf(spot);
  const broad: BroadSeaLabel =
    (BROAD_SEA_OF as Record<string, BroadSeaLabel>)[label] ?? (label as BroadSeaLabel);

  // 1. 湾・灘の狭域指定（大分類そのものは後段で見る）
  if (apt.seaOverrides && label !== broad) {
    const v = apt.seaOverrides[label];
    if (v !== undefined) return v;
  }
  // 2. 県指定（数値 or 大分類海域ごとの分解）
  const pref = prefByName.get(spot.region.prefecture);
  if (pref && apt.prefectureOverrides) {
    const p = apt.prefectureOverrides[pref.slug];
    if (typeof p === "number") return p;
    if (p !== undefined) {
      const v = p[broad];
      if (v !== undefined) return v;
    }
  }
  // 3. 大分類海域
  if (apt.seaOverrides) {
    const v = apt.seaOverrides[broad];
    if (v !== undefined) return v;
  }
  // 4. 8地域
  if (pref?.regionSlug && apt.regionOverrides) {
    const v = apt.regionOverrides[pref.regionSlug];
    if (v !== undefined) return v;
  }
  return apt.default;
}

// ── スコアとtier ────────────────────────────────────

const assessmentCache = new Map<string, CatchAssessment | null>();

function computeAssessment(spot: FishingSpot, fishSlug: string): CatchAssessment | null {
  // 同一スポット同一魚の複数エントリ（春/秋エギング等）はベスト値で集約
  let found = false;
  let anyPeak = false;
  let anySource = false;
  for (const cf of spot.catchableFish) {
    if (cf.fish.slug !== fishSlug) continue;
    found = true;
    anyPeak = anyPeak || cf.peakSeason;
    anySource = anySource || Boolean(cf.source);
  }
  if (!found) return null;

  const apt = fishRegionalAptitude[fishSlug];
  if (!apt) {
    // 適性未定義: 従来ロジック（表示・並び順を一切変えないフォールバック）
    return {
      tier: anyPeak ? "excellent" : "good",
      score: spot.rating + (anyPeak ? 2 : 1),
    };
  }

  const regional = resolveRegionalLevel(spot, apt);
  const category = categoryBySlug.get(fishSlug) ?? "sea";
  const terrain = getSpotTypeAptitude(fishSlug, category, spot.spotType);

  // ハードゲート: 生息域外・地形不適合・二重の境界域は掲載しない
  if (regional === 0 || terrain === 0) return { tier: "excluded", score: 0 };
  if (regional === 1 && terrain === 1) return { tier: "excluded", score: 0 };

  const score =
    regional * 12 +
    terrain * 6 +
    (anyPeak ? 8 : 0) +
    (anySource ? 8 : 0) +
    spot.rating * 2.4;

  let tier: CatchTier;
  if (score < 28) tier = "excluded";
  else if (regional === 1 || terrain === 1) tier = "fair"; // 境界域は最高でも△
  else if (score >= 70 && regional >= 3 && terrain >= 2) tier = "excellent";
  else if (score >= 45) tier = "good";
  else tier = "fair";

  return { tier, score };
}

/** 魚種×スポットの評価（メモ化）。スポットにその魚のエントリが無ければ null */
export function getCatchAssessment(
  spot: FishingSpot,
  fishSlug: string
): CatchAssessment | null {
  const key = `${spot.id}|${fishSlug}`;
  let cached = assessmentCache.get(key);
  if (cached === undefined) {
    cached = computeAssessment(spot, fishSlug);
    assessmentCache.set(key, cached);
  }
  return cached;
}

/** 「釣れる度」4段階（エントリが無い魚は excluded） */
export function getCatchTier(spot: FishingSpot, fishSlug: string): CatchTier {
  return getCatchAssessment(spot, fishSlug)?.tier ?? "excluded";
}

/** 並び順用スコア（エントリが無い魚は 0） */
export function getCatchScore(spot: FishingSpot, fishSlug: string): number {
  return getCatchAssessment(spot, fishSlug)?.score ?? 0;
}

/**
 * このスポットをこの魚の「釣れるスポット」として掲載してよいか。
 * 一覧・件数・県×魚種/マトリクスの掲載判定・sitemap で共用する唯一のゲート。
 */
export function isFishListedAtSpot(spot: FishingSpot, fishSlug: string): boolean {
  return getCatchTier(spot, fishSlug) !== "excluded";
}

/** この魚種に地域適性データが投入済みか（テスト・レポート用） */
export function hasRegionalAptitude(fishSlug: string): boolean {
  return fishSlug in fishRegionalAptitude;
}
