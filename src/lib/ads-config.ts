/**
 * 広告スロットID設定
 *
 * 現状 AdSense 広告ユニットは3個（display/multiplex/inArticle）しかなく、15種の
 * 広告枠が使い回している。これだと AdSense 側のユニット別最適化・レポート分割が効かない。
 *
 * ここでは placement（広告枠の論理名、ads-tracking.ts と一致）ごとにスロットIDを
 * 引けるようにし、各値を環境変数で差し替え可能にする。専用スロットID 未発行のうちは
 * 既存3スロットにフォールバックするため、env 未設定でも従来通り動作する（段階移行）。
 *
 * 運用: GA4(PR#85)のデータで稼ぐ枠が判明したら、その枠だけ AdSense 管理画面で新しい
 * 広告ユニットを発行し、対応する NEXT_PUBLIC_AD_SLOT_* に設定する。
 *
 * 注意: NEXT_PUBLIC_* は Next.js がビルド時にインライン置換するため、必ず静的に直接
 * 参照すること（process.env[key] の動的アクセスはクライアントで undefined になる）。
 * env が空文字/未設定のどちらでもフォールバックさせたいので `||` を使う。
 */

// 既存の物理スロット（専用ユニット未発行時のフォールバック先）
const FALLBACK_DISPLAY = "9949278874";
const FALLBACK_MULTIPLEX = "8230049272";
const FALLBACK_IN_ARTICLE = "4852864864";

/** placement 論理名 → スロットID。未設定時は既存スロットにフォールバック */
export const AD_SLOTS = {
  in_article: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || FALLBACK_IN_ARTICLE,
  display: process.env.NEXT_PUBLIC_AD_SLOT_DISPLAY || FALLBACK_DISPLAY,
  native_break: process.env.NEXT_PUBLIC_AD_SLOT_NATIVE_BREAK || FALLBACK_DISPLAY,
  multiplex: process.env.NEXT_PUBLIC_AD_SLOT_MULTIPLEX || FALLBACK_MULTIPLEX,
  pre_footer: process.env.NEXT_PUBLIC_AD_SLOT_PRE_FOOTER || FALLBACK_MULTIPLEX,
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || FALLBACK_DISPLAY,
  sidebar_sticky: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_STICKY || FALLBACK_DISPLAY,
  header_banner: process.env.NEXT_PUBLIC_AD_SLOT_HEADER_BANNER || FALLBACK_DISPLAY,
  side_rail: process.env.NEXT_PUBLIC_AD_SLOT_SIDE_RAIL || FALLBACK_DISPLAY,
  in_feed: process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED || FALLBACK_DISPLAY,
  parallel: process.env.NEXT_PUBLIC_AD_SLOT_PARALLEL || FALLBACK_DISPLAY,
  mobile_sticky: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_STICKY || FALLBACK_DISPLAY,
  mobile_header_banner: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_HEADER_BANNER || FALLBACK_DISPLAY,
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
