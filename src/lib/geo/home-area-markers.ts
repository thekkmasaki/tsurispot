import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";

/**
 * ホーム地図バンドの初期マーカー（1件＝1都道府県）。
 * page.tsx（Server Component）で算出し、軽量な配列としてクライアントへ渡す。
 * ※ fishingSpots 全件はクライアントに渡さず、この十数件の重心だけを props 化する。
 */
export interface AreaMarker {
  slug: string;
  name: string;
  nameShort: string;
  lat: number;
  lng: number;
  count: number;
}

// 全国をおおよそ均等にカバーする厳選都道府県。リンク先 /prefecture/[slug] は全件 SSG＝index 対象。
const HOME_AREA_SLUGS = [
  "hokkaido",
  "miyagi",
  "chiba",
  "kanagawa",
  "shizuoka",
  "aichi",
  "osaka",
  "hyogo",
  "wakayama",
  "hiroshima",
  "ehime",
  "fukuoka",
  "okinawa",
];

/**
 * 各都道府県のスポット重心（平均緯度経度）と件数を返す。
 * 座標を持たない prefectures.ts の代わりに、スポット座標から重心を算出する（ビルド時に 1 回）。
 */
export function getHomeAreaMarkers(): AreaMarker[] {
  const markers: AreaMarker[] = [];
  for (const slug of HOME_AREA_SLUGS) {
    const pref = prefectures.find((p) => p.slug === slug);
    if (!pref) continue;
    const spots = fishingSpots.filter((s) => s.region.prefecture === pref.name);
    if (spots.length === 0) continue;
    let sumLat = 0;
    let sumLng = 0;
    for (const s of spots) {
      sumLat += s.latitude;
      sumLng += s.longitude;
    }
    markers.push({
      slug,
      name: pref.name,
      nameShort: pref.nameShort,
      lat: sumLat / spots.length,
      lng: sumLng / spots.length,
      count: spots.length,
    });
  }
  return markers;
}
