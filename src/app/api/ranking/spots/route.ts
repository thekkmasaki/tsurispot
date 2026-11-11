import { NextResponse } from "next/server";
import { buildRankingSpots } from "@/lib/data/ranking-spots";

/**
 * /ranking の絞り込み（都道府県・カテゴリ）と「現在地の近く」用の全スポットデータ。
 * 以前は /ranking の HTML に全件を埋め込んでおり gzip 後でも約336KBあった。
 * 初期 HTML には既定（全国・総合）の TOP10 だけを載せ、全件は表示後にここから1回だけ取得する。
 * force-static ＝ ビルド時にプリレンダし CDN 配信。
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return NextResponse.json(buildRankingSpots(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
