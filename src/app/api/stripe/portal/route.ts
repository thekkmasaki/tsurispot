import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbGet } from "@/lib/dynamodb";
import { getStripeCustomerId } from "@/lib/shop-plan";

export async function POST(request: NextRequest) {
  let body: { shopSlug: string; token: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { shopSlug, token } = body;
  if (!shopSlug || !token) {
    return NextResponse.json({ error: "shopSlug, token required" }, { status: 400 });
  }

  // Stripe 環境変数チェック（未設定なら利用不可）
  if (!stripe) {
    console.error("[Stripe portal] STRIPE_SECRET_KEY が未設定です");
    return NextResponse.json(
      { error: "決済システムが現在ご利用いただけません。" },
      { status: 503 }
    );
  }

  // トークン認証
  const storedToken = await dbGet<string>(`SHOP#${shopSlug}`, "TOKEN");
  if (!storedToken || storedToken !== token) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 403 });
  }

  const customerId = await getStripeCustomerId(shopSlug);
  if (!customerId) {
    return NextResponse.json({ error: "サブスクリプション情報が見つかりません" }, { status: 404 });
  }

  const origin = request.nextUrl.origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/shops/${shopSlug}/dashboard?token=${token}`,
  });

  return NextResponse.json({ url: session.url });
}
