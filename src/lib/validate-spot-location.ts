/**
 * スポット座標の検証
 * OpenStreetMap Nominatim API（無料・キー不要）で逆ジオコーディングし、
 * 1. 実在する場所か
 * 2. 水辺（釣り可能な場所）の近くか
 * を判定する。
 */

export interface LocationValidation {
  isValid: boolean;
  isNearWater: boolean;
  placeName: string;
  placeType: string;
  warnings: string[];
  details: string;
}

// 水辺に関連するOSMタグのキーワード
const WATER_KEYWORDS = [
  "water", "harbour", "harbor", "port", "pier", "dock", "marina",
  "beach", "coastline", "coast", "bay", "cape", "peninsula",
  "river", "stream", "canal", "lake", "pond", "reservoir",
  "fishing", "fish", "breakwater", "jetty", "quay", "wharf",
  "sea", "ocean", "strait", "inlet",
  // 日本語
  "港", "漁港", "堤防", "防波堤", "磯", "海岸", "浜", "川", "河",
  "湖", "池", "沼", "ダム", "釣り", "マリーナ",
];

// 釣り禁止になりやすい場所のキーワード
const RESTRICTED_KEYWORDS = [
  "military", "airport", "airbase", "prison", "nuclear",
  "power_plant", "industrial", "factory",
  "自衛隊", "空港", "原発", "刑務所",
];

/**
 * Nominatim APIで逆ジオコーディング
 */
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&extratags=1&namedetails=1&zoom=18`,
      {
        headers: {
          "User-Agent": "TsuriSpot/1.0 (fishingspotjapan@gmail.com)",
          "Accept-Language": "ja",
        },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 近隣の水域を検索
 */
async function searchNearbyWater(
  lat: number,
  lng: number
): Promise<boolean> {
  try {
    // 半径500m以内の水域を検索
    const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=water&format=json&bounded=1&viewbox=${bbox}&limit=5`,
      {
        headers: {
          "User-Agent": "TsuriSpot/1.0 (fishingspotjapan@gmail.com)",
          "Accept-Language": "ja",
        },
      }
    );
    if (!res.ok) return false;
    const results = await res.json();
    return Array.isArray(results) && results.length > 0;
  } catch {
    return false;
  }
}

/**
 * 座標を検証して釣りスポットとして適切か判定する
 */
export async function validateSpotLocation(
  lat: number,
  lng: number
): Promise<LocationValidation> {
  const warnings: string[] = [];

  // 1. 日本国内チェック
  if (lat < 24 || lat > 46 || lng < 122 || lng > 154) {
    return {
      isValid: false,
      isNearWater: false,
      placeName: "",
      placeType: "",
      warnings: ["座標が日本国内ではありません"],
      details: "日本国内の座標を入力してください",
    };
  }

  // 2. 逆ジオコーディング
  const result = await reverseGeocode(lat, lng);

  if (!result || (result as { error?: string }).error) {
    return {
      isValid: false,
      isNearWater: false,
      placeName: "",
      placeType: "",
      warnings: ["この座標の場所情報を取得できませんでした"],
      details: "座標を確認してください",
    };
  }

  const displayName = (result.display_name as string) || "";
  const type = (result.type as string) || "";
  const category = (result.category as string) || "";
  const address = (result.address as Record<string, string>) || {};

  // 3. 水辺チェック
  const allText = [
    displayName,
    type,
    category,
    ...Object.values(address),
    JSON.stringify(result.extratags || {}),
    JSON.stringify(result.namedetails || {}),
  ]
    .join(" ")
    .toLowerCase();

  let isNearWater = WATER_KEYWORDS.some((kw) =>
    allText.includes(kw.toLowerCase())
  );

  // 直接的な水辺キーワードが見つからない場合、近隣検索
  if (!isNearWater) {
    isNearWater = await searchNearbyWater(lat, lng);
  }

  if (!isNearWater) {
    warnings.push(
      "この場所は水辺から離れている可能性があります。座標が正しいか確認してください。"
    );
  }

  // 4. 釣り禁止エリアチェック
  const isRestricted = RESTRICTED_KEYWORDS.some((kw) =>
    allText.includes(kw.toLowerCase())
  );
  if (isRestricted) {
    warnings.push(
      "この場所は立入制限がある可能性があります。釣りが許可されているか確認してください。"
    );
  }

  // 5. 住所から場所名を構築
  const placeName =
    address.amenity ||
    address.tourism ||
    address.leisure ||
    (result.namedetails as Record<string, string>)?.name ||
    address.suburb ||
    address.city_district ||
    "";

  return {
    isValid: true,
    isNearWater,
    placeName: placeName || displayName.split(",")[0] || "",
    placeType: `${category}/${type}`,
    warnings,
    details: displayName,
  };
}
