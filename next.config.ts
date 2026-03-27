import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

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
    // 存在しないslugへのアクセスを正しいスポットへリダイレクト
    {
      source: '/spots/soma-ko',
      destination: '/spots/soma-ko-add3',
      permanent: true,
    },
    {
      source: '/spots/tsubasa-port-detail',
      destination: '/spots/tsubasa-port',
      permanent: true,
    },
    {
      source: '/spots/awaji-tsubasa-port',
      destination: '/spots/tsubasa-port',
      permanent: true,
    },
    {
      source: '/spots/hachinohe-ko',
      destination: '/spots/hachinohe-port',
      permanent: true,
    },
    {
      source: '/spots/kushiro-ko',
      destination: '/spots/kushiro-port',
      permanent: true,
    },
    {
      source: '/spots/hakodate-ko',
      destination: '/spots/hakodate-port',
      permanent: true,
    },
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
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: http:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://*.microcms.io https://*.upstash.io https://api.open-meteo.com https://marine-api.open-meteo.com; frame-src https://www.google.com https://www.youtube.com https://pagead2.googlesyndication.com;",
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
  ],
};

export default withBundleAnalyzer(nextConfig);
