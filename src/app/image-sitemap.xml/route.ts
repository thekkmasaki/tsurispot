import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

const baseUrl = "https://tsurispot.com";

// 実画像（実写・イラスト）のみを配信する。
// 旧実装は全スポット・全魚種に OGP 画像(/api/og?title=...)を <image:loc> として約5,400件
// 配信しており、GSC「クロール済み-インデックス未登録」の最大の供給源になっていた
// （OGPカードはテキスト画像で画像検索価値ゼロ。しかも robots.txt では /api/ を除外予定という矛盾）。
// OGP 画像は各ページの og:image メタタグだけで十分で、sitemap から Google に押し込まない。

export async function GET() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // スポットの画像（通常 sitemap と同じ品質基準: description>=100 かつ catchableFish>=2。
  // noindex/薄ページの画像をGoogle画像検索に出さないよう統一する）
  for (const spot of fishingSpots.filter(
    (s) => (s.description || "").length >= 100 && s.catchableFish.length >= 2,
  )) {
    let images = "";

    // mainImageUrl
    if (spot.mainImageUrl) {
      const imgUrl = spot.mainImageUrl.startsWith("http")
        ? spot.mainImageUrl
        : `${baseUrl}${spot.mainImageUrl}`;
      images += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(spot.name)}</image:title>
      <image:caption>${escapeXml(`${spot.name} - ${spot.region.prefecture}${spot.region.areaName}の釣り場`)}</image:caption>
    </image:image>`;
    }

    // spotPhotos
    if (spot.spotPhotos) {
      for (const photo of spot.spotPhotos.slice(0, 3)) {
        const photoUrl = photo.url.startsWith("http")
          ? photo.url
          : `${baseUrl}${photo.url}`;
        images += `
    <image:image>
      <image:loc>${escapeXml(photoUrl)}</image:loc>
      <image:title>${escapeXml(photo.alt || spot.name)}</image:title>
    </image:image>`;
      }
    }

    // 実画像が1枚も無いスポットはエントリ自体を出さない（空<url>はノイズ）
    if (!images) continue;

    xml += `
  <url>
    <loc>${baseUrl}/spots/${spot.slug}</loc>${images}
  </url>`;
  }

  // 魚種の画像（実写画像を持つ魚種のみ）
  for (const fish of fishSpecies) {
    if (!fish.imageUrl) continue;
    const fishImgUrl = fish.imageUrl.startsWith("http")
      ? fish.imageUrl
      : `${baseUrl}${fish.imageUrl}`;
    xml += `
  <url>
    <loc>${baseUrl}/fish/${fish.slug}</loc>
    <image:image>
      <image:loc>${escapeXml(fishImgUrl)}</image:loc>
      <image:title>${escapeXml(fish.name)}</image:title>
      <image:caption>${escapeXml(`${fish.name}（${fish.nameKana}）`)}</image:caption>
    </image:image>
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
