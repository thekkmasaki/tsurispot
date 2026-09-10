import type { RegionSlug } from "@/types";
import type { BroadSeaLabel, SeaLabel } from "@/lib/geo/sea-label";

/**
 * 魚種×地域/地形の適性レベル。
 * 0 = 生息せず・地形不適合（一覧から除外）
 * 1 = まれ（分布の北限・南限などの境界域。表示は最高でも「△まずまず」）
 * 2 = 普通（全国デフォルト）
 * 3 = 好適
 * 4 = 特筆（漁獲量上位・釣りのメッカ）
 */
export type AptitudeLevel = 0 | 1 | 2 | 3 | 4;

/** 「釣れる度」4段階。excluded は一覧・件数・sitemap すべてから外す */
export type CatchTier = "excellent" | "good" | "fair" | "excluded";

/**
 * 県単位のオーバーライド値。
 * 数値ならその県全域。2つの海に面する県（兵庫・山口・福岡・佐賀等）は
 * 大分類海域ごとの値を指定でき、スポット座標から自動で振り分けられる
 * （例: yamaguchi: { 日本海: 4, 瀬戸内海: 2 }）。
 */
export type PrefectureAptitude =
  | AptitudeLevel
  | Partial<Record<BroadSeaLabel, AptitudeLevel>>;

/**
 * 魚種1種の地域適性定義。
 * 解決優先順位: prefectureOverrides（海域分解つき）→ seaOverrides（湾→大分類の順）
 * → regionOverrides（8地域）→ default。
 * 根拠データ: 農林水産省 海面漁業生産統計調査の魚種×県別漁獲量 + 釣り実績
 * （方法論は docs/fish-aptitude-sources.md 参照）。
 */
export interface FishRegionalAptitude {
  /** 全国デフォルト */
  default: AptitudeLevel;
  /** 8地域単位の一括指定（分布の北限・南限を粗く書く用） */
  regionOverrides?: Partial<Record<RegionSlug, AptitudeLevel>>;
  /** 都道府県slug単位（regionより優先。海域分解も可） */
  prefectureOverrides?: Partial<Record<string, PrefectureAptitude>>;
  /** 海域単位（湾・灘の狭域指定は大分類より優先） */
  seaOverrides?: Partial<Record<SeaLabel, AptitudeLevel>>;
  /** 根拠の要約（レビュー可能にするため必須） */
  rationale: string;
  /** 出典（例: "海面漁業生産統計調査 いか類県別漁獲量"） */
  sources?: string[];
}
