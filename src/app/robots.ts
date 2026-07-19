import type { MetadataRoute } from "next";

// 検索エンジン向けクロール除外パス。
// 注意(RFC 9309): クローラーは「最も具体的にマッチする User-Agent グループ**だけ**」に従う。
// 以前は { userAgent: "Googlebot", allow: "/" } 等の独立グループがあり、Googlebot/Bingbot には
// * グループの disallow が一切適用されていなかった（GSC「クロール済み-インデックス未登録」に
// /api/og 等のアセットURLが数千件積まれた原因）。検索botは * グループに任せ、個別グループは
// 「全面ブロックしたいbot」か「全面許可が意図のbot（広告・SNSカード）」のみに限定すること。
// - /_next/ の一括 disallow は Googlebot のレンダリング資源(JS/CSS = /_next/static)まで塞ぎ
//   レンダリング評価を壊すため、重複画像URLを生む /_next/image のみに絞る。
// - noindex にしたいページ(/mypage /login 等)は meta タグに一本化（disallow すると
//   クローラーが noindex を読めず「ブロック済みだがインデックス登録」になるため）。
const CRAWL_DISALLOW = [
  "/api/",
  "/_next/image",
  "/shops/*/dashboard",
  "/spots/compare",
  "/*/opengraph-image",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: CRAWL_DISALLOW,
      },
      // 広告クローラー: AdsBot-Google は仕様上 * グループを無視するため明示的に全面許可。
      // Mediapartners-Google(AdSense) も広告配信判定のため全面許可を維持する。
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
      // SNSカード: Twitterbot は robots.txt を尊重するため、OGP画像(/api/og,
      // /*/opengraph-image)を取得できるよう全面許可（* に落とすとXカードの画像が壊れる）。
      { userAgent: "Twitterbot", allow: "/" },
      // 「学習はNo・検索/引用はYes」: OAI-SearchBot / ChatGPT-User / PerplexityBot は
      // * グループ（allow: / + アセット除外）で十分なため個別グループは持たない。
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
