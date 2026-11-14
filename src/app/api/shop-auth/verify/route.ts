import { NextRequest, NextResponse } from "next/server";
import { verifyShopToken, getEffectivePlan } from "@/lib/shop-plan";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * 管理画面の認証API。{ shop, token } を受け取り、DynamoDB のトークンと照合する。
 * 認証成功時は実効プランも返す（ダッシュボードのプラン表示に利用可）。
 * 従来 dashboard-client.tsx にハードコードされていた TOKENS を置き換える。
 */
export async function POST(request: NextRequest) {
  let body: { shop?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const { shop, token } = body;
  if (!shop || !token) {
    return NextResponse.json({ ok: false, error: "shop, token required" }, { status: 400 });
  }

  // トークン総当たり対策（IP単位: 10分に30回・shop-info と同じ枠）
  if (!(await checkRateLimit(getClientIp(request), "SHOPINFO_AUTH", 30, 600))) {
    return NextResponse.json({ ok: false, error: "too many requests" }, { status: 429 });
  }

  try {
    const ok = await verifyShopToken(shop, token);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    const plan = await getEffectivePlan(shop);
    return NextResponse.json({ ok: true, plan });
  } catch (err) {
    console.error("[shop-auth/verify] エラー:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
