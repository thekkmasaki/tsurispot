import { NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpots } from "@/lib/data/list-spot";

/**
 * /spots 一覧の絞り込み用・全スポットの軽量データ（ListSpot）。
 *
 * 以前は /spots の HTML（RSC ペイロード）に全件を埋め込んでおり、gzip 後でも約500KB
 * （非圧縮 4MB 超）あった。初期 HTML には既定の1ページ目（20件）だけを SSR し、
 * 全件はページ表示後にこの API から1回だけ取得する。
 *
 * force-static ＝ ビルド時にプリレンダし CDN 配信（App Runner の毎回課金なし）。
 * データは TS ハードコードのため、デプロイ時に再生成されれば十分。
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return NextResponse.json(toListSpots(fishingSpots), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
