/**
 * revalidate も dynamic も持たない「完全静的」ページのルート一覧。
 *
 * Next はこれらに `Cache-Control: s-maxage=31536000`（1年）を付けるため、Cloudflare に
 * 古いHTMLが何か月も残る。古いHTMLが参照するJSチャンクはデプロイで消えるので、
 * /map は108日前のHTMLがJSを404にして地図が白紙になっていた（2026-11 監査・本番ヘッダで確認）。
 * next.config の headers でエッジのキャッシュを1日＋SWRに上書きする。
 *
 * 注意: 動的ページ（private, no-store を返すページ）を絶対に入れないこと。
 * 共有キャッシュに個人のページが載る。/mypage・/favorites・/users は除外している。
 * 新しい静的ページを足したら、ここか EXCLUDED に入れる（テストで検出する）。
 */
export const STATIC_HTML_ROUTES: readonly string[] = [
  // 一覧・機能ページ
  "/about", "/about/editorial-policy", "/ai", "/area", "/area-guide", "/beginner-checklist",
  "/bouzu-checker", "/contact", "/faq", "/faq/beginner", "/faq/season", "/faq/spot",
  "/faq/technique", "/fish-finder", "/fishdex", "/fishing", "/for-beginners", "/gear",
  "/gear/rod-beginner", "/gear/sabiki", "/gear/tackle-box", "/glossary", "/glossary-quiz",
  "/ig", "/legal", "/map", "/me", "/methods", "/partner", "/prefecture",
  "/privacy", "/quiz", "/ranking", "/safety", "/shops", "/shops/badge", "/shops/update",
  "/sitemap-page", "/spot-feature", "/spot-type", "/technology", "/terms", "/tides",
  "/umigyo", "/umigyo/for-municipalities",
  // ガイド
  "/guide", "/guide/:slug", "/guide/eging/gear",
  // 釣りインストラクター試験
  "/instructor-exam", "/instructor-exam/:topic", "/instructor-exam/:topic/quiz",
  // パラメータ付き（generateStaticParams で静的生成）
  "/area-guide/:slug",
  "/fish/:slug/method/:method",
  "/fishing-rules/:prefecture",
  "/fishing/:method",
  "/fishing/:method/area/:region",
  "/methods/:slug",
  "/prefecture/:slug/all",
  "/prefecture/:slug/:month/:fishSlug",
  "/prefecture/:slug/fish/:fishSlug",
  "/prefecture/:slug/fishing/:method",
  "/quiz/:category",
  "/shops/:slug",
  "/spot-feature/:feature",
  "/spot-feature/:feature/:prefecture",
  "/spot-type/:type",
  "/spot-type/:type/:prefecture",
  "/subscribe/:plan",
];

/** revalidate/dynamic の指定は無いが、上の一覧に入れないページ（理由つき）。 */
export const STATIC_HTML_EXCLUDED: Readonly<Record<string, string>> = {
  "/favorites": "動的（private, no-store）",
  "/mypage": "動的（private, no-store）",
  "/mypage/fishdex": "動的（private, no-store）",
  "/mypage/prefecture-map": "動的（private, no-store）",
  "/mypage/records": "動的（private, no-store）",
  "/mypage/stats": "動的（private, no-store）",
  "/users/[tsuriId]": "動的（private, no-store）",
  "/fish": "next.config に個別の Cache-Control あり",
  "/spots/compare": "next.config の /spots/:slug が適用される",
  "/spots/submit": "next.config の /spots/:slug が適用される",
  "/fish/[slug]": "next.config に個別の Cache-Control あり",
  "/area/[slug]": "next.config に個別の Cache-Control あり",
  "/prefecture/[slug]": "next.config に個別の Cache-Control あり",
};

export const STATIC_HTML_CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";
