import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import spotRedirects from "./src/lib/data/spot-redirects.json";
import { dedupRedirects, fishingSpots } from "./src/lib/data/spots";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// 生存しているslugの集合
const liveSlugSet = new Set(fishingSpots.map(s => s.slug));

// spot-redirects.json + dedup自動リダイレクトを統合。
// チェーン(A→B→C)を最終生存slugまで解決し、常に1ホップの301にする（GSCのリダイレクトエラー対策）。
const allRedirects = new Map<string, string>();

// oldSlug を生存している最終ターゲットまで解決（JSON→dedup を辿る・ループ防止つき）
function resolveTarget(slug: string, seen = new Set<string>()): string | null {
  if (liveSlugSet.has(slug)) return slug; // 生存 → 確定
  if (seen.has(slug)) return null; // ループ防止
  seen.add(slug);
  const jsonNext = (spotRedirects as Record<string, string>)[slug];
  if (jsonNext) return resolveTarget(jsonNext, seen);
  const dedupNext = dedupRedirects.get(slug);
  if (dedupNext) return resolveTarget(dedupNext, seen);
  return null; // デッドターゲット（解決不能）
}

// 1. dedup自動リダイレクト（最優先: 確実に正しいターゲットを持つ）
for (const [oldSlug, newSlug] of dedupRedirects) {
  if (liveSlugSet.has(oldSlug)) continue; // source が生存 = 301不要
  const finalTarget = resolveTarget(newSlug);
  if (finalTarget && finalTarget !== oldSlug) {
    allRedirects.set(oldSlug, finalTarget);
  }
}

// 2. spot-redirects.jsonの手動リダイレクト（チェーン完全解決・生存先のみ登録）
for (const [oldSlug, rawTarget] of Object.entries(spotRedirects)) {
  if (allRedirects.has(oldSlug)) continue; // dedup自動が優先
  if (liveSlugSet.has(oldSlug)) continue; // source が生存 = 無駄な301を出さない（代替canonical汚れ防止）
  const finalTarget = resolveTarget(rawTarget as string);
  if (finalTarget && finalTarget !== oldSlug) {
    allRedirects.set(oldSlug, finalTarget); // 必ず1ホップ・生存先
  }
  // 解決不能（デッドターゲット）はスキップ → 壊れた301を防止
}

const spotRedirectEntries = Array.from(allRedirects.entries()).map(([oldSlug, newSlug]) => ({
  source: `/spots/${oldSlug}`,
  destination: `/spots/${newSlug}`,
  permanent: true as const,
}));

const nextConfig: NextConfig = {
  // Docker/App Runner用: 最小限のスタンドアロン出力を生成
  output: "standalone",
  // react-leaflet ESM + Webpack互換性修正
  transpilePackages: ['react-leaflet', '@react-leaflet/core'],
  // パフォーマンス: X-Powered-By ヘッダーを削除（不要な情報漏洩防止＋レスポンスサイズ削減）
  poweredByHeader: false,
  // パフォーマンス: gzip圧縮を確実に有効化
  compress: true,
  redirects: async () => [
    {
      source: '/planner',
      destination: '/for-beginners',
      permanent: true,
    },
    // 魚種slug変更リダイレクト
    {
      source: '/fish/seabass',
      destination: '/fish/suzuki',
      permanent: true,
    },
    // 重複除去で消失したslug → 正しいslugへ301リダイレクト
    ...spotRedirectEntries,
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "tsurispot-uploads.s3.ap-northeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "d1e2nn2dhqfows.cloudfront.net",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 31536000,
    formats: ['image/avif'],
    // App Runner の Next.js Image Optimization が同じ画像を返すバグ発生中。
    // S3 直接配信に切替えて optimization なしで素のファイルを配信する。
    // avif/webp 変換は失うが、元 jpeg/webp が S3 にあるので OK。
    unoptimized: true,
    // variant 数削減: deviceSizes default 8 + imageSizes default 8 = 16 sizes × 2 format = 32 variant/画像
    // → deviceSizes 4 + imageSizes 2 = 6 sizes × 1 format = 6 variant/画像 (1/5 に削減)
    deviceSizes: [640, 1080, 1920, 2560],
    imageSizes: [256, 512],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googlesyndication.com https://partner.googleadservices.com https://*.doubleclick.net https://*.google.com https://adservice.google.com https://adservice.google.co.jp https://fundingchoicesmessages.google.com https://*.gstatic.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; img-src 'self' data: blob: https: http:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google https://*.microcms.io https://*.upstash.io https://api.open-meteo.com https://marine-api.open-meteo.com; frame-src https://*.google.com https://www.youtube.com https://*.googlesyndication.com https://*.doubleclick.net https://fundingchoicesmessages.google.com https://*.adtrafficquality.google;",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self)",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        { key: "X-Robots-Tag", value: "noai, noimageai" },
      ],
    },
    // SSGページのCloudFrontキャッシュ最適化（App Runnerへのリクエスト削減）
    {
      // /spots（リスト一覧）専用 - SSG 化でデフォルト挙動 OK だが念のため明示
      source: "/spots",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
      ],
    },
    {
      // /fish（リスト一覧）専用 - 軽量化済み
      source: "/fish",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
      ],
    },
    {
      source: "/spots/:slug",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/fish/:slug",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/prefecture/:slug",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/area/:slug",
      headers: [
        // 7日キャッシュは soft-404（存在しないslugが200で返るページ）をCloudflareに長期キャッシュさせ
        // 害が大きいため、他の詳細ページと同じ1時間+SWRに短縮。
        { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/images/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/(.*\\.(?:ico|svg|woff|woff2))",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    // 認証必要なページ: ユーザー固有HTMLなのでCloudFrontに共有キャッシュさせない
    // Next.js App Router の "use client" ページは default で s-maxage=31536000 が
    // 付くため、古いログイン状態のHTMLが返って「1回目ログインできない」症状を起こす。
    {
      source: "/mypage/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/mypage",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/favorites",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
      ],
    },
    {
      source: "/login",
      headers: [
        { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
      ],
    },
  ],
};

export default withBundleAnalyzer(nextConfig);
