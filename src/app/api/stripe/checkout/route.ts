import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getStripeCustomerId, setStripeCustomerId, getShopSubscription } from "@/lib/shop-plan";
import { verifyShopAuth } from "@/lib/shop-session";
import { checkStripeCheckoutEnv } from "@/lib/stripe-env";

export async function POST(request: NextRequest) {
  let body: { shopSlug?: unknown; plan?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { shopSlug, plan, token } = body;
  if (typeof shopSlug !== "string" || !shopSlug || !plan) {
    return NextResponse.json({ error: "shopSlug, plan required" }, { status: 400 });
  }
  if (plan !== "basic" && plan !== "pro") {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  // Stripe 環境変数チェック（未設定なら決済不可。サイレント失敗を防ぐ）
  const env = checkStripeCheckoutEnv(plan);
  if (!stripe || !env.ok) {
    console.error(
      "[Stripe checkout] 環境変数が未設定のため決済できません:",
      env.missing.join(", ") || "STRIPE_SECRET_KEY"
    );
    return NextResponse.json(
      { error: "決済システムが現在ご利用いただけません。お手数ですが時間をおいて再度お試しください。" },
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

  // 既存サブスクチェック
  const existing = await getShopSubscription(shopSlug);
  if (existing && existing.status === "active") {
    return NextResponse.json({ error: "既にアクティブなサブスクリプションがあります" }, { status: 400 });
  }

  // Stripe Customer取得/作成
  let customerId = await getStripeCustomerId(shopSlug);
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { shopSlug },
    });
    customerId = customer.id;
    await setStripeCustomerId(shopSlug, customerId);
  }

  // Price/Coupon ID（env チェック済み: priceId は存在保証、couponId は任意）
  const priceId = env.priceId!;
  const couponId = env.couponId;
  if (!couponId) {
    console.error(`[Stripe checkout] クーポン未設定のため3ヶ月無料が適用されません: plan=${plan}`);
  }

  const origin = request.nextUrl.origin;

  // Checkout Session作成
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { shopSlug, plan },
    // トークンは URL に載せない（Stripe 側ログ・履歴・Referer への漏えい防止）。戻り先では shop_session Cookie で認証する
    success_url: `${origin}/shops/${shopSlug}/dashboard?subscribed=true&plan=${plan}`,
    cancel_url: `${origin}/subscribe/${plan}?shop=${shopSlug}`,
    locale: "ja",
  };

  // 初回のみクーポン適用（既存サブスクがない場合）
  if (couponId && !existing) {
    sessionParams.discounts = [{ coupon: couponId }];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return NextResponse.json({ url: session.url });
}
