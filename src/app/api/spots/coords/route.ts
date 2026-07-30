import { NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";

/**
 * 全スポットの軽量座標データ。
 *
 * ホームの「近くの釣り場」バンドが、ユーザーが「現在地を許可して探す」を押した時に
 * 1 回だけ取得し、クライアント側で現在地からの近い順（Haversine）を計算するために使う。
 *
 * force-static ＝ ビルド時にプリレンダし CDN(Cloudflare) 配信されるため、App Runner の
 * 毎回課金が発生しない。全 7,600 件をホーム初期 HTML に埋め込むと 45KB→数百KB に肥大し
 * CWV/SEO を悪化させるため、この API に外出しして「押した人だけ・1 回だけ」取得する。
 *
 * キーは payload 削減のため短縮（クライアントで復元する）:
 *   s=slug, n=name, la=lat, lo=lng, t=spotType, r=rating, p=prefecture, a=areaName, f=isFree
 */
export const dynamic = "force-static";
export const revalidate = 604800; // 1週間ごとに再生成

export function GET() {
  const coords = fishingSpots.map((s) => ({
    s: s.slug,
    n: s.name,
    la: s.latitude,
    lo: s.longitude,
    t: s.spotType,
    r: s.rating,
    p: s.region.prefecture,
    a: s.region.areaName,
    f: s.isFree,
  }));

  return NextResponse.json(coords, {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
