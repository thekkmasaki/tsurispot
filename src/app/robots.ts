import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/shops/*/dashboard",
          "/spots/submit",
          "/spots/compare",
          "/favorites",
          "/*/opengraph-image",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Yandex",
        allow: "/",
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
      },
      // AI Crawler Bots
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "Bytespider",
        allow: "/",
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
      },
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
      },
      {
        userAgent: "YouBot",
        allow: "/",
      },
      {
        userAgent: "AI2Bot",
        allow: "/",
      },
      {
        userAgent: "Timpibot",
        allow: "/",
      },
      {
        userAgent: "ImagesiftBot",
        allow: "/",
      },
      {
        userAgent: "Diffbot",
        allow: "/",
      },
    ],
    sitemap: [
      "https://tsurispot.com/sitemap.xml",
      "https://tsurispot.com/image-sitemap.xml",
    ],
    host: "https://tsurispot.com",
  };
}
