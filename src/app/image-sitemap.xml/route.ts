import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

const baseUrl = "https://tsurispot.com";

export async function GET() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // スポットの画像
  for (const spot of fishingSpots) {
    xml += `
  <url>
    <loc>${baseUrl}/spots/${spot.slug}</loc>`;

    // mainImageUrl
    if (spot.mainImageUrl) {
      const imgUrl = spot.mainImageUrl.startsWith("http")
        ? spot.mainImageUrl
        : `${baseUrl}${spot.mainImageUrl}`;
      xml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(spot.name)}</image:title>
      <image:caption>${escapeXml(`${spot.name} - ${spot.region.prefecture}${spot.region.areaName}の釣り場`)}</image:caption>
    </image:image>`;
    }

    // OGP画像
    xml += `
    <image:image>
      <image:loc>${baseUrl}/api/og/spot/${spot.slug}</image:loc>
      <image:title>${escapeXml(`${spot.name} | ツリスポ`)}</image:title>
    </image:image>`;

    // spotPhotos
    if (spot.spotPhotos) {
      for (const photo of spot.spotPhotos.slice(0, 3)) {
        const photoUrl = photo.url.startsWith("http")
          ? photo.url
          : `${baseUrl}${photo.url}`;
        xml += `
    <image:image>
      <image:loc>${escapeXml(photoUrl)}</image:loc>
      <image:title>${escapeXml(photo.alt || spot.name)}</image:title>
    </image:image>`;
      }
    }

    xml += `
  </url>`;
  }

  // 魚種の画像
  for (const fish of fishSpecies) {
    xml += `
  <url>
    <loc>${baseUrl}/fish/${fish.slug}</loc>`;

    if (fish.imageUrl) {
      const fishImgUrl = fish.imageUrl.startsWith("http")
        ? fish.imageUrl
        : `${baseUrl}${fish.imageUrl}`;
      xml += `
    <image:image>
      <image:loc>${escapeXml(fishImgUrl)}</image:loc>
      <image:title>${escapeXml(fish.name)}</image:title>
      <image:caption>${escapeXml(`${fish.name}（${fish.nameKana}）`)}</image:caption>
    </image:image>`;
    }

    xml += `
    <image:image>
      <image:loc>${baseUrl}/api/og/fish/${fish.slug}</image:loc>
      <image:title>${escapeXml(`${fish.name} | ツリスポ`)}</image:title>
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
