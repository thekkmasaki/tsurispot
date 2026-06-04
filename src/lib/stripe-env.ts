/**
 * Stripe 関連の環境変数が揃っているかを検証する。
 * 未設定の必須キーを `missing` に列挙し、`ok` で揃っているかを返す。
 *
 * 背景: checkout / webhook / portal の各ルートは従来 `process.env.X!`（非null
 * assertion）で環境変数を参照しており、未設定時はサイレントに Stripe API エラーや
 * 署名検証失敗を起こしていた。本関数で事前に検証し、未設定なら 503 を返せるようにする。
 */
export interface StripeEnvCheck {
  ok: boolean;
  /** 未設定だった必須キー名 */
  missing: string[];
  /** plan を渡したときの Price ID（未設定なら undefined） */
  priceId?: string;
  /** plan を渡したときの Coupon ID（未設定なら undefined。クーポンは任意） */
  couponId?: string;
  /** Webhook 署名検証用シークレット（webhook チェック時のみ） */
  webhookSecret?: string;
}

/**
 * Checkout に必要な環境変数を検証する。
 * - 必須: STRIPE_SECRET_KEY, （plan 指定時）STRIPE_PRICE_BASIC / STRIPE_PRICE_PRO
 * - 任意: STRIPE_COUPON_BASIC / STRIPE_COUPON_PRO（3ヶ月無料キャンペーン用。
 *   未設定でも決済自体は成立するため missing には含めない）
 */
export function checkStripeCheckoutEnv(plan?: "basic" | "pro"): StripeEnvCheck {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");

  let priceId: string | undefined;
  let couponId: string | undefined;
  if (plan) {
    const priceKey = plan === "pro" ? "STRIPE_PRICE_PRO" : "STRIPE_PRICE_BASIC";
    priceId = process.env[priceKey];
    if (!priceId) missing.push(priceKey);

    couponId = plan === "pro"
      ? process.env.STRIPE_COUPON_PRO
      : process.env.STRIPE_COUPON_BASIC;
  }

  return { ok: missing.length === 0, missing, priceId, couponId };
}

/**
 * Webhook に必要な環境変数を検証する。
 * 必須: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */
export function checkStripeWebhookEnv(): StripeEnvCheck {
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  return {
    ok: missing.length === 0,
    missing,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}
