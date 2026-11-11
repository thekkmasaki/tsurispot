import { NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";
import { getWantedSpots } from "@/lib/photo-wanted";

/**
 * 写真募集（編集部写真なし）スポットの軽量一覧。/photo-wanted とトップの WANTED 帯が
 * 「近くの件数」を出すために必要時だけ取得する。force-static ＝ ビルド時生成・CDN 配信。
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return NextResponse.json(getWantedSpots(fishingSpots), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
