import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
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
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
