/**
 * 広告スロットID設定
 *
 * placement（広告枠の論理名）ごとに専用の AdSense 広告ユニット ID を割り当て、
 * AdSense 側のユニット別最適化・レポート分割を効かせる。発行済みの専用ユニット
 * （header-banner/in-feed/mobile-sticky/sidebar-sticky/pre-footer 等）を既定値に配線済み。
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

// 汎用フォールバック（専用ユニット未発行の placement 用）
const FALLBACK_DISPLAY = "9949278874"; // AdSenseユニット「ツリスポ」(ディスプレイ)
const FALLBACK_MULTIPLEX = "8230049272"; // 「tsurispot-multiplex」(Multiplex)
const FALLBACK_IN_ARTICLE = "4852864864"; // 「tsurispot-in-article」(記事内)

// 発行済みの専用ユニット（2026-07作成）。従来は env 未設定で FALLBACK_DISPLAY に埋もれ、
// 1枠を8〜13回使い回して fill率11-14% の一因になっていた。placement 別 ID として既定値に
// 直接配線する（slot ID は公開情報のためハードコード可。env での上書きも従来どおり可能）。
const SLOT_HEADER_BANNER = "1024506275"; // 「tsurispot-header-banner」
const SLOT_IN_FEED = "1222614147"; // 「tsurispot-in-feed」(インフィード)
const SLOT_MOBILE_STICKY = "1027173022"; // 「mobile-sticky」
const SLOT_SIDEBAR_STICKY = "2727267509"; // 「tsurispot-sidebar-sticky」
const SLOT_PRE_FOOTER = "2572324064"; // 「Multiplex広告」(pre_footer を multiplex と分離)

/** placement 論理名 → スロットID。未設定時は既存スロットにフォールバック */
export const AD_SLOTS = {
  in_article: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || FALLBACK_IN_ARTICLE,
  display: process.env.NEXT_PUBLIC_AD_SLOT_DISPLAY || FALLBACK_DISPLAY,
  native_break: process.env.NEXT_PUBLIC_AD_SLOT_NATIVE_BREAK || FALLBACK_DISPLAY, // 専用未発行→display共有
  multiplex: process.env.NEXT_PUBLIC_AD_SLOT_MULTIPLEX || FALLBACK_MULTIPLEX,
  pre_footer: process.env.NEXT_PUBLIC_AD_SLOT_PRE_FOOTER || SLOT_PRE_FOOTER,
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || FALLBACK_DISPLAY, // 専用未発行→display共有
  sidebar_sticky: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_STICKY || SLOT_SIDEBAR_STICKY,
  header_banner: process.env.NEXT_PUBLIC_AD_SLOT_HEADER_BANNER || SLOT_HEADER_BANNER,
  side_rail: process.env.NEXT_PUBLIC_AD_SLOT_SIDE_RAIL || FALLBACK_DISPLAY, // 専用未発行→display共有
  in_feed: process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED || SLOT_IN_FEED,
  mobile_sticky: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_STICKY || SLOT_MOBILE_STICKY,
  mobile_header_banner: process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_HEADER_BANNER || SLOT_HEADER_BANNER, // header共有
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
