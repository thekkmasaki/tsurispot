import { NextRequest, NextResponse } from "next/server";
import { getShopSubscription } from "@/lib/shop-plan";
import { verifyShopAuth } from "@/lib/shop-session";

async function handle(request: NextRequest, shop: unknown, token: unknown) {
  if (typeof shop !== "string" || !shop) {
    return NextResponse.json({ error: "shop required" }, { status: 400 });
  }

  // 認証（shop_session Cookie または後方互換の token）
  let tokenOk = false;
  try {
    tokenOk = await verifyShopAuth(request, shop, token);
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
  if (!tokenOk) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 403 });
  }

  const subscription = await getShopSubscription(shop);
  return NextResponse.json({ subscription }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * POST { shop, token? }: 推奨。token は URL に載せず、shop_session Cookie で認証する。
 */
export async function POST(request: NextRequest) {
  let body: { shop?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  return handle(request, body.shop, body.token);
}

/**
 * GET ?shop=&token=: 後方互換（旧クライアント用）。新規実装は POST を使うこと。
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return handle(request, sp.get("shop"), sp.get("token"));
}
