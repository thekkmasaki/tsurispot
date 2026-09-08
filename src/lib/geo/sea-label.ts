/**
 * 座標→海域ラベル判定（scripts/lib/sea-label-resolver.mjs のTS移植）。
 *
 * 魚種×地域適性（fish-aptitude）が「日本海側は好適・瀬戸内は普通」のような
 * 海域単位の判定に使う。兵庫（香住=日本海/明石=瀬戸内）のように1県が
 * 複数の海に面するケースを座標で分解するのが目的。
 * scripts版と判定ロジックを変えるときは必ず両方を同期すること
 * （同期は src/lib/geo/__tests__/sea-label.test.ts の代表座標で担保）。
 */

/** 個別の湾・灘・海峡（狭域） */
export type BaySeaLabel =
  | "東京湾" | "大阪湾" | "相模湾" | "駿河湾" | "伊勢湾" | "若狭湾" | "富山湾"
  | "有明海" | "玄界灘" | "響灘" | "紀伊水道" | "豊後水道" | "津軽海峡"
  | "噴火湾" | "陸奥湾" | "播磨灘" | "備讃瀬戸";

/** 大分類の海域 */
export type BroadSeaLabel = "日本海" | "太平洋" | "瀬戸内海" | "東シナ海" | "オホーツク海";

export type SeaLabel = BaySeaLabel | BroadSeaLabel;

const SEA_AREAS: { name: SeaLabel; lat: number; lng: number; radius: number }[] = [
  { name: "東京湾", lat: 35.35, lng: 139.85, radius: 0.5 },
  { name: "大阪湾", lat: 34.55, lng: 135.15, radius: 0.4 },
  { name: "相模湾", lat: 35.15, lng: 139.3, radius: 0.4 },
  { name: "駿河湾", lat: 34.9, lng: 138.55, radius: 0.5 },
  { name: "伊勢湾", lat: 34.8, lng: 136.8, radius: 0.4 },
  { name: "若狭湾", lat: 35.65, lng: 135.5, radius: 0.3 },
  { name: "富山湾", lat: 36.8, lng: 137.2, radius: 0.3 },
  { name: "有明海", lat: 33.0, lng: 130.4, radius: 0.4 },
  { name: "玄界灘", lat: 33.7, lng: 130.2, radius: 0.5 },
  { name: "響灘", lat: 33.95, lng: 130.8, radius: 0.3 },
  { name: "紀伊水道", lat: 33.9, lng: 135.0, radius: 0.4 },
  { name: "豊後水道", lat: 33.1, lng: 132.2, radius: 0.4 },
  // 津軽海峡は松前・函館・竜飛をカバーするため半径を0.4→0.45に拡大
  { name: "津軽海峡", lat: 41.5, lng: 140.5, radius: 0.45 },
  { name: "噴火湾", lat: 42.3, lng: 140.7, radius: 0.3 },
  { name: "陸奥湾", lat: 41.0, lng: 140.85, radius: 0.3 },
  { name: "播磨灘", lat: 34.6, lng: 134.6, radius: 0.3 },
  { name: "備讃瀬戸", lat: 34.35, lng: 133.8, radius: 0.3 },
  // オホーツク海の巨大円（半径2.0度）は釧路・根室の太平洋岸まで飲み込んでいたため
  // 廃止し、大域判定（lat>43.6 かつ lng>142）に置き換えた
];

/** 湾・灘 → 属する大分類海域（対馬暖流系の玄界灘・響灘は日本海側として扱う） */
export const BROAD_SEA_OF: Record<BaySeaLabel, BroadSeaLabel> = {
  東京湾: "太平洋", 相模湾: "太平洋", 駿河湾: "太平洋", 伊勢湾: "太平洋",
  紀伊水道: "太平洋", 豊後水道: "太平洋", 噴火湾: "太平洋",
  若狭湾: "日本海", 富山湾: "日本海", 玄界灘: "日本海", 響灘: "日本海",
  津軽海峡: "日本海", 陸奥湾: "日本海",
  大阪湾: "瀬戸内海", 播磨灘: "瀬戸内海", 備讃瀬戸: "瀬戸内海",
  有明海: "東シナ海",
};

function degreeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * 座標から最も近い海域名（湾・灘を優先し、該当なしは大域判定）。
 *
 * 旧実装（scripts版初版）は日本海の判定が「lng<136」のみで、新潟・山形・秋田・
 * 青森西岸・石川・北海道西岸がすべて太平洋と誤判定されていた（他に大分→日本海、
 * 萩→瀬戸内、釧路→オホーツク等）。日本海/太平洋の分水嶺を緯度の関数として
 * 引き直した実測検証済みの境界（本州: 敦賀/直江津/酒田/深浦=日本海、
 * 静岡/いわき/仙台/八戸=太平洋。北海道: 小樽/留萌/稚内=日本海、苫小牧=太平洋）。
 */
export function resolveSeaLabel(lat: number, lng: number): SeaLabel {
  let closest: SeaLabel | null = null;
  let closestDist = Infinity;
  for (const area of SEA_AREAS) {
    const dist = degreeDistance(lat, lng, area.lat, area.lng);
    if (dist <= area.radius && dist < closestDist) {
      closest = area.name;
      closestDist = dist;
    }
  }
  if (closest) return closest;

  // 東シナ海（九州西岸。天草・八代海 lng~130.2-130.5 を含み、鹿児島湾 lng~130.6 は除く）
  if (lng < 130) return "東シナ海";
  if (lat < 33.7 && lng < 130.55) return "東シナ海";

  // 瀬戸内海（東部: 広島〜播磨。西部: 周防灘〜安芸灘は山口日本海側=萩・長門を含まない
  // よう上限緯度を分ける。高知・宇和海・大分は含まない）
  if (lat >= 33.9 && lat <= 34.8 && lng >= 132.4 && lng <= 135.2) return "瀬戸内海";
  if (lat >= 33.6 && lat <= 34.35 && lng >= 131 && lng < 132.4) return "瀬戸内海";

  // 北海道（下北半島先端 lat>=41.4 を含むが、津軽海峡は上の湾判定が先に効く）
  if (lat >= 41.4) {
    if (lat > 43.6 && lng > 142) return "オホーツク海";
    // 西岸の分水嶺: 小樽(43.2,141.0)・留萌(43.9,141.6)・稚内(45.4,141.7)=日本海 /
    // 苫小牧(42.6,141.6)・尻屋崎=太平洋
    if (lng < 0.9 * lat + 102.5) return "日本海";
    return "太平洋";
  }

  // 本州・四国・九州の日本海/太平洋分水嶺（lat<=36は敦賀136.06を含む定数、
  // 北上につれ東へ。上限140.8で気仙沼・八戸の太平洋岸を守る）
  const divide = lat <= 36 ? 136.2 : Math.min(136.2 + 2.0 * (lat - 36), 140.8);
  if (lat >= 34.3 && lng < divide) return "日本海";
  return "太平洋";
}

/** 座標から大分類海域（日本海/太平洋/瀬戸内海/東シナ海/オホーツク海）を返す */
export function resolveBroadSea(lat: number, lng: number): BroadSeaLabel {
  const label = resolveSeaLabel(lat, lng);
  return (BROAD_SEA_OF as Record<string, BroadSeaLabel>)[label] ?? (label as BroadSeaLabel);
}
