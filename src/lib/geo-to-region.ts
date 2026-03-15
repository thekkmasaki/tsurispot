/**
 * 緯度経度から8地域のRegionSlugに変換するユーティリティ
 * 大まかな緯度+経度の範囲で判定（海上等は最寄りの地域に）
 */
import type { RegionSlug } from "@/types";

interface RegionBounds {
  slug: RegionSlug;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

// 優先度順（狭い範囲から判定）
const REGION_BOUNDS: RegionBounds[] = [
  // 沖縄（九州に含める）
  { slug: "kyushu", latMin: 24.0, latMax: 28.0, lonMin: 122.0, lonMax: 132.0 },
  // 北海道
  { slug: "hokkaido", latMin: 41.3, latMax: 46.0, lonMin: 139.3, lonMax: 146.0 },
  // 東北
  { slug: "tohoku", latMin: 36.8, latMax: 41.3, lonMin: 139.0, lonMax: 142.5 },
  // 関東
  { slug: "kanto", latMin: 35.0, latMax: 36.8, lonMin: 138.8, lonMax: 140.9 },
  // 中部（広域）
  { slug: "chubu", latMin: 34.7, latMax: 37.8, lonMin: 136.0, lonMax: 139.2 },
  // 近畿
  { slug: "kinki", latMin: 33.4, latMax: 35.8, lonMin: 134.0, lonMax: 136.8 },
  // 中国
  { slug: "chugoku", latMin: 33.8, latMax: 35.6, lonMin: 130.8, lonMax: 134.4 },
  // 四国
  { slug: "shikoku", latMin: 32.7, latMax: 34.3, lonMin: 132.0, lonMax: 134.8 },
  // 九州
  { slug: "kyushu", latMin: 30.0, latMax: 34.0, lonMin: 128.5, lonMax: 132.2 },
];

/**
 * 緯度経度からRegionSlugを推定
 * マッチしない場合はnull
 */
export function getRegionFromCoords(lat: number, lon: number): RegionSlug | null {
  for (const bounds of REGION_BOUNDS) {
    if (
      lat >= bounds.latMin &&
      lat <= bounds.latMax &&
      lon >= bounds.lonMin &&
      lon <= bounds.lonMax
    ) {
      return bounds.slug;
    }
  }
  // フォールバック: 緯度だけで大まかに判定
  if (lat >= 41.3) return "hokkaido";
  if (lat >= 37.5) return "tohoku";
  if (lat >= 35.5) return "kanto";
  if (lat >= 34.5) return "chubu";
  if (lat >= 33.5) return "kinki";
  if (lat >= 32.5) return "chugoku";
  return "kyushu";
}
