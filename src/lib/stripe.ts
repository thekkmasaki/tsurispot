import Stripe from "stripe";

// ビルド時はキーが未設定のためプレースホルダーを使用（API呼び出し時にランタイムで実キーが使われる）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_build_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});
