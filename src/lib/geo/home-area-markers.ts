import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";

/**
 * ホーム地図バンドの初期マーカー（1件＝1都道府県）。
 * page.tsx（Server Component）で算出し、軽量な配列としてクライアントへ渡す。
 * ※ fishingSpots 全件はクライアントに渡さず、都道府県ごとの重心＋件数だけを props 化する。
 */
export interface AreaMarker {
  slug: string;
  name: string;
  nameShort: string;
  regionGroup: string;
  lat: number;
  lng: number;
  count: number;
}

/**
 * スポットが存在する全都道府県の重心（平均緯度経度）と件数を返す。
 * 座標を持たない prefectures.ts の代わりに、スポット座標から重心を算出する（ビルド時に 1 回）。
 * 地図は markercluster で密集を吸収し、fitBounds で北海道〜沖縄まで収める前提。
 * 返り値は prefectures.ts の並び＝地方順（北海道→東北→…→九州・沖縄）。
 */
export function getHomeAreaMarkers(): AreaMarker[] {
  const markers: AreaMarker[] = [];
  for (const pref of prefectures) {
    const spots = fishingSpots.filter((s) => s.region.prefecture === pref.name);
    if (spots.length === 0) continue;
    let sumLat = 0;
    let sumLng = 0;
    for (const s of spots) {
      sumLat += s.latitude;
      sumLng += s.longitude;
    }
    markers.push({
      slug: pref.slug,
      name: pref.name,
      nameShort: pref.nameShort,
      regionGroup: pref.regionGroup,
      lat: sumLat / spots.length,
      lng: sumLng / spots.length,
      count: spots.length,
    });
  }
  return markers;
}
