import { NextResponse } from "next/server";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import { getStationMergedData } from "@/lib/tide/tide-data";

/**
 * 潮汐観測地点ごとの満干時刻・潮位データ（気象庁 潮位表の天文潮推算値）。
 *
 * スポット詳細の潮汐カードが、そのスポットの最寄り観測地点ぶんを1回だけ取得し、
 * クライアント側で選択日の満干を表示するために使う。
 *
 * force-static ＝ ビルド時に239地点ぶんプリレンダし CDN(Cloudflare) 配信されるため、
 * App Runner の毎回課金が発生しない（/api/spots/coords と同じ方式）。
 * データはイメージ内 public/tide-data/ が正で、更新は年次のデータ再生成＋デプロイで行う。
 *
 * 出典: 気象庁 潮位表 https://www.data.jma.go.jp/kaiyou/db/tide/suisan/
 */
export const dynamic = "force-static";
export const revalidate = 86400; // 1日ごとに再生成
export const dynamicParams = false;

export function generateStaticParams() {
  return TIDE_STATIONS.map((s) => ({ code: s.code }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const data = getStationMergedData(code);
  if (!data) {
    return NextResponse.json({ error: "unknown station" }, { status: 404 });
  }
  return NextResponse.json(data, {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
