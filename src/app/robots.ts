import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /mypage /login /spots/submit /favorites は noindex メタに一本化したため disallow しない（disallow するとクローラーが noindex を読めず「ブロック済みだがインデックス登録」になるため）。
        disallow: [
          "/api/",
          "/_next/",
          "/shops/*/dashboard",
          "/spots/compare",
          "/*/opengraph-image",
        ],
      },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Yandex", allow: "/" },
      { userAgent: "Baiduspider", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      // 「学習はNo・検索/引用はYes」: 検索インデックス・リアルタイム引用のbotは許可し、被引用→送客を狙う。
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      // 純粋な学習用クローラーは引き続き拒否。
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
      { userAgent: "Meta-ExternalAgent", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },
      { userAgent: "Amazonbot", disallow: "/" },
      { userAgent: "YouBot", disallow: "/" },
      { userAgent: "AI2Bot", disallow: "/" },
      { userAgent: "Timpibot", disallow: "/" },
      { userAgent: "ImagesiftBot", disallow: "/" },
      { userAgent: "Diffbot", disallow: "/" },
      { userAgent: "MicroAdBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "CriteoBot", disallow: "/" },
      { userAgent: "Sogou", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
    ],
    sitemap: [
      "https://tsurispot.com/sitemap.xml",
      "https://tsurispot.com/image-sitemap.xml",
    ],
    host: "https://tsurispot.com",
  };
}
