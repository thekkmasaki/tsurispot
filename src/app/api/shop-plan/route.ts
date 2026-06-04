import { NextRequest, NextResponse } from "next/server";
import { getEffectivePlan } from "@/lib/shop-plan";

export const runtime = "nodejs";

/**
 * 公開API: 店舗の「実効プラン」を返す（認証不要）。
 * 返すのは plan のみで、サブスクID・顧客情報は一切含めない（情報漏洩なし。
 * プラン自体は元々ページに表示される公開情報）。
 * 詳細ページの有料機能ブロックが Client からこれを叩いて表示を出し分ける。
 */
export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "shop required" }, { status: 400 });
  }
  try {
    const plan = await getEffectivePlan(shop);
    return NextResponse.json(
      { shop, plan },
      {
        headers: {
          // CDN キャッシュ。実ユーザーアクセス時のみ DynamoDB を引く＝負荷最小。
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[shop-plan] 取得エラー:", err);
    // 失敗時は free（有料機能を誤表示しない安全側フォールバック）
    return NextResponse.json({ shop, plan: "free" });
  }
}
