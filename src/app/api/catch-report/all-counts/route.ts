import { NextResponse } from "next/server";
import { dbScanCatchCounts } from "@/lib/dynamodb";

export const runtime = "nodejs";
// revalidate=86400(24h): 旧3600(毎時)は dbScanCatchCounts() の DynamoDB 全件Scan を毎時走らせ、
// 昼のクローラ集中時のCPU/RCUスパイクに寄与していた。ヒートマップは日次更新で実害がないため、
// 全ScanをCDN/ISRで日次に間引く（Scan頻度 1/24）。
export const revalidate = 86400;

// GET: 全スポットの釣果カウントを一括取得
// クライアント側でヒートマップに使用。24時間 CDN キャッシュ。
export async function GET() {
  // ビルド時(SSG prerender)は dbScanCatchCounts() の DynamoDB 全スキャンが
  // 静的生成の60秒タイムアウトを超えてビルド自体を落とす（#191 デプロイ失敗の原因）。
  // ビルド時はスキャンせず空を返し、実データは初回ランタイムの ISR 生成で充填する。
  // （NEXT_PHASE ガードは spots/[slug]・catch-reports 等で確立済みのパターン）
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json(
      { counts: {} },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      },
    );
  }
  try {
    const counts = await dbScanCatchCounts();
    return NextResponse.json(
      { counts },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ counts: {} }, { status: 200 });
  }
}
