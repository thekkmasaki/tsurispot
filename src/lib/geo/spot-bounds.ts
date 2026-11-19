/** Leaflet の fitBounds にそのまま渡せる [[南, 西], [北, 東]]。 */
export type BoundsTuple = [[number, number], [number, number]];

/**
 * スポット群が収まる範囲を返す。
 * trim を指定すると、緯度・経度それぞれの両端からその割合を外して範囲を取る。
 * 県を選んだとき、離島の数件に引っ張られて地図が引きすぎになるのを防ぐためのもの
 * （例: 東京都を選ぶと小笠原まで入って本土が豆粒になる）。
 * 件数が少ないとき（20件未満）は外さない。
 */
export function spotBounds(
  points: readonly { latitude: number; longitude: number }[],
  trim = 0
): BoundsTuple | null {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.latitude).sort((a, b) => a - b);
  const lngs = points.map((p) => p.longitude).sort((a, b) => a - b);
  const n = points.length;
  const useTrim = trim > 0 && n >= 20;
  const lo = useTrim ? Math.floor(n * trim) : 0;
  const hi = useTrim ? Math.max(lo, Math.ceil(n * (1 - trim)) - 1) : n - 1;
  return [
    [lats[lo], lngs[lo]],
    [lats[hi], lngs[hi]],
  ];
}

export interface PrefectureLabel {
  name: string;
  lat: number;
  lng: number;
  count: number;
}

/** 都道府県ごとの件数と重心（平均座標）。引いた地図で県名ラベルを出すために使う。 */
export function prefectureLabels(
  spots: readonly { latitude: number; longitude: number; region: { prefecture: string } }[]
): PrefectureLabel[] {
  const acc = new Map<string, { lat: number; lng: number; count: number }>();
  for (const s of spots) {
    const cur = acc.get(s.region.prefecture);
    if (cur) {
      cur.lat += s.latitude;
      cur.lng += s.longitude;
      cur.count++;
    } else {
      acc.set(s.region.prefecture, { lat: s.latitude, lng: s.longitude, count: 1 });
    }
  }
  return Array.from(acc.entries()).map(([name, v]) => ({
    name,
    lat: v.lat / v.count,
    lng: v.lng / v.count,
    count: v.count,
  }));
}
