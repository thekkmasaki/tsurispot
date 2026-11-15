import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { isSitemapEligible } from "@/lib/seo-quality";
import { isDisplayableSpotImage } from "@/lib/data/spot-image-resolver";

const baseUrl = "https://tsurispot.com";

// 実画像（実写・イラスト）のみを配信する。
// 旧実装は全スポット・全魚種に OGP 画像(/api/og?title=...)を <image:loc> として約5,400件
// 配信しており、GSC「クロール済み-インデックス未登録」の最大の供給源になっていた
// （OGPカードはテキスト画像で画像検索価値ゼロ。しかも robots.txt では /api/ を除外予定という矛盾）。
// OGP 画像は各ページの og:image メタタグだけで十分で、sitemap から Google に押し込まない。
//
// 2026-11: mainImageUrl をそのまま出していたため placeholder.webp（本番404）が約2,700件
// 載っていた。表示判定を詳細ページと同じ isDisplayableSpotImage() に統一し、実在する画像だけを出す。
// また Google が廃止した <image:title>/<image:caption> は出力しない（<image:loc> のみ有効）。

function absUrl(url: string): string {
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

function imageTag(url: string): string {
  return `
    <image:image>
      <image:loc>${escapeXml(absUrl(url))}</image:loc>
    </image:image>`;
}

export async function GET() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // スポットの画像（通常 sitemap と同じ品質基準 isSitemapEligible。
  // noindex/薄ページの画像をGoogle画像検索に出さないよう統一する）
  for (const spot of fishingSpots.filter((s) => isSitemapEligible(s))) {
    const urls = new Set<string>();
    if (isDisplayableSpotImage(spot.mainImageUrl)) urls.add(spot.mainImageUrl);
    for (const photo of (spot.spotPhotos ?? []).slice(0, 3)) {
      if (isDisplayableSpotImage(photo.url)) urls.add(photo.url);
    }

    // 実画像が1枚も無いスポットはエントリ自体を出さない（空<url>はノイズ）
    if (urls.size === 0) continue;

    xml += `
  <url>
    <loc>${baseUrl}/spots/${spot.slug}</loc>${[...urls].map(imageTag).join("")}
  </url>`;
  }

  // 魚種の画像（実写画像を持つ魚種のみ）
  for (const fish of fishSpecies) {
    if (!fish.imageUrl) continue;
    xml += `
  <url>
    <loc>${baseUrl}/fish/${fish.slug}</loc>${imageTag(fish.imageUrl)}
  </url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
