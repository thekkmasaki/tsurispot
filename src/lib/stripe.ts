import Stripe from "stripe";

// STRIPE_SECRET_KEY が未設定なら null。各 API ルートで null チェックして 503 を返す。
// （旧実装は "sk_test_build_placeholder" にフォールバックしており、未設定時に
//  サイレントに決済が失敗していたため、明示的に「利用不可」を返せるよう null にする）
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
    })
  : null;
