import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/shop-plan";
import { verifyShopAuth } from "@/lib/shop-session";

export async function POST(request: NextRequest) {
  let body: { shopSlug?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { shopSlug, token } = body;
  if (typeof shopSlug !== "string" || !shopSlug) {
    return NextResponse.json({ error: "shopSlug required" }, { status: 400 });
  }

  // Stripe 環境変数チェック（未設定なら利用不可）
  if (!stripe) {
    console.error("[Stripe portal] STRIPE_SECRET_KEY が未設定です");
    return NextResponse.json(
      { error: "決済システムが現在ご利用いただけません。" },
      { status: 503 }
    );
  }

  // 認証（shop_session Cookie または後方互換の body.token）
  let tokenOk = false;
  try {
    tokenOk = await verifyShopAuth(request, shopSlug, token);
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
  if (!tokenOk) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 403 });
  }

  const customerId = await getStripeCustomerId(shopSlug);
  if (!customerId) {
    return NextResponse.json({ error: "サブスクリプション情報が見つかりません" }, { status: 404 });
  }

  const origin = request.nextUrl.origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    // トークンは URL に載せない。戻り先では shop_session Cookie で認証する
    return_url: `${origin}/shops/${shopSlug}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
