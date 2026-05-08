import { NextResponse } from "next/server";
import { dbScanCatchCounts } from "@/lib/dynamodb";

export const runtime = "nodejs";
export const revalidate = 3600;

// GET: 全スポットの釣果カウントを一括取得
// クライアント側でヒートマップに使用。1時間 CDN キャッシュ。
export async function GET() {
  try {
    const counts = await dbScanCatchCounts();
    return NextResponse.json(
      { counts },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ counts: {} }, { status: 200 });
  }
}
