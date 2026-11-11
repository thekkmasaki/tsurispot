/**
 * 写真募集（WANTED）: 編集部の写真が無いスポットを判定する（サーバー専用・fishingSpots を受け取る）。
 * サウナイキタイの「未入力施設の情報募集中」を手本にした投稿促進（2026-11）。
 * 写真が無いのは全体の約9割と多いため、画面では「近く」「県」単位の件数で見せる。
 */
import type { FishingSpot } from "@/types";
import { isDisplayableSpotImage } from "@/lib/data/spot-image-resolver";

export interface WantedSpot {
  slug: string;
  name: string;
  prefecture: string;
  areaName: string;
  spotType: FishingSpot["spotType"];
  lat: number;
  lng: number;
  /** 人気度（並び順用） */
  pop: number;
}

export function isPhotoWanted(spot: FishingSpot): boolean {
  if (isDisplayableSpotImage(spot.mainImageUrl)) return false;
  return !(spot.spotPhotos ?? []).some((p) => isDisplayableSpotImage(p.url));
}

export function toWantedSpot(spot: FishingSpot): WantedSpot {
  return {
    slug: spot.slug,
    name: spot.name,
    prefecture: spot.region.prefecture,
    areaName: spot.region.areaName,
    spotType: spot.spotType,
    lat: Math.round(spot.latitude * 1e5) / 1e5,
    lng: Math.round(spot.longitude * 1e5) / 1e5,
    pop: Math.round(spot.rating * (spot.reviewCount + 1) * 10) / 10,
  };
}

/** 人気順の写真募集スポット一覧 */
export function getWantedSpots(spots: FishingSpot[]): WantedSpot[] {
  return spots
    .filter(isPhotoWanted)
    .map(toWantedSpot)
    .sort((a, b) => b.pop - a.pop);
}

export function countWantedByPrefecture(wanted: WantedSpot[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of wanted) m.set(w.prefecture, (m.get(w.prefecture) ?? 0) + 1);
  return m;
}
