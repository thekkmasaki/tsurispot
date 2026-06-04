# Stripe 本番セットアップ手順（B2B釣具店向け課金）

ツリスポの B2B 課金（釣具店の有料プラン）を**実際に動かす**ための手順。
コード側の実装（PR1〜PR4）は完了しているが、決済を稼働させるには下記の
**Stripe 設定 + App Runner 環境変数投入**が必須。これらが未設定の間、
checkout/webhook/portal は `503`（利用不可）を返す設計になっている。

> 前提プラン: ベーシック（初年度 月額500円 → 2年目以降 980円）／プロ（初年度 月額1,980円 → 2年目以降 2,980円）。
> 価格の正は `src/lib/data/plans.ts`。

---

## 1. Stripe Dashboard で Product / Price を作成

[Stripe Dashboard](https://dashboard.stripe.com/) → 商品（Products）。**本番モード**で作成すること。

### ベーシックプラン
- Product 名: `ツリスポ ベーシックプラン`
- Price: **月額 ¥500**（通貨 JPY / 継続 recurring / 請求間隔 monthly）
- 作成後の **Price ID（`price_xxx`）** を控える → 環境変数 `STRIPE_PRICE_BASIC`

### プロプラン
- Product 名: `ツリスポ プロプラン`
- Price: **月額 ¥1,980**（JPY / monthly）
- **Price ID** → `STRIPE_PRICE_PRO`

> ⚠️ **2年目以降の価格（980 / 2,980円）への自動切替は Stripe 単体ではできない。**
> 初年度 Price で運用し、1年経過後に手動で Price 変更、または
> [Subscription Schedules](https://stripe.com/docs/billing/subscriptions/subscription-schedules) を組む。
> （コードは初年度 Price のみを扱う）

---

## 2. Coupon（3ヶ月無料キャンペーン）を作成

問い合わせフォーム（`paid-plan-inquiry.tsx`）に「今なら3ヶ月無料」と告知しているため、
**クーポン未設定だと告知と実挙動が乖離**する（特商法・景表法リスク）。必ず設定するか、告知を外すこと。

- Stripe Dashboard → クーポン（Coupons）→ 新規作成
  - 割引: **100% off**
  - 適用期間（Duration）: **repeating**、**months = 3**
- 作成した **Coupon ID** を控える
  - ベーシック用 → `STRIPE_COUPON_BASIC`
  - プロ用 → `STRIPE_COUPON_PRO`
  - （内容が同一でも、コードは plan ごとに別IDを参照する。同じ Coupon を両方に設定してもよい）

> クーポンは**初回サブスクのみ**自動適用される（`checkout/route.ts`: 既存サブスクがない場合のみ `discounts` を付与）。

---

## 3. Webhook エンドポイントを登録

Stripe Dashboard → 開発者 → Webhook → エンドポイントを追加。

- URL: `https://tsurispot.com/api/stripe/webhook`
- 受信イベント（以下の **5種**。`webhook/route.ts` が処理する）:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.paid`
- 作成後の **Signing secret（`whsec_xxx`）** を控える → `STRIPE_WEBHOOK_SECRET`

---

## 4. App Runner に環境変数を投入

AWS App Runner → サービス `tsurispot` → 設定 → 環境変数（Runtime environment variables）。
以下を追加してデプロイ（再起動）する:

| 変数名 | 値 |
|--------|-----|
| `STRIPE_SECRET_KEY` | Stripe の本番シークレットキー `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | 手順3の `whsec_xxx` |
| `STRIPE_PRICE_BASIC` | 手順1のベーシック Price ID |
| `STRIPE_PRICE_PRO` | 手順1のプロ Price ID |
| `STRIPE_COUPON_BASIC` | 手順2のベーシック Coupon ID |
| `STRIPE_COUPON_PRO` | 手順2のプロ Coupon ID |
| `ADMIN_SECRET` | 任意の長いランダム文字列（トークン発行APIの保護用。手順6で使用） |

> これらが揃うまで checkout/webhook/portal は `503` を返す（サイレント失敗しない設計）。

---

## 5. 既存デモ店舗のトークンを投入（PR3 の移行作業）

PR3 でダッシュボード認証をハードコードから DynamoDB トークンに移行した。
従来デモアクセスできた店舗は、以下のいずれかで **DynamoDB にトークンを発行**するまで管理画面に入れない。

- 対象（旧ハードコード）: `point-honmoku` / `joshunya-enoshima` / `casting-toyosu` / `joshunya-wakayama` / `fishing-yu-oiso` / `barbless-karatsu`
- サンプル店舗（`sample-free` / `sample-basic` / `sample-premium`）は `token=demo` で閲覧可（投入不要）。

発行は手順6の admin API で行う。

---

## 6. 店舗トークンの発行（オンボーディング）

新規掲載店・既存店のオーナーに管理URLを渡すには、トークン発行APIを使う。

```bash
curl -X POST https://tsurispot.com/api/admin/shop-token \
  -H "Authorization: Bearer ${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"shop":"point-honmoku"}'
# → { "shop":"point-honmoku", "token":"<32文字>", "dashboardUrl":"https://tsurispot.com/shops/point-honmoku/dashboard?token=...", "created":true }
```

- `dashboardUrl` をオーナーにメール送付すれば、その店舗の管理画面に入れる。
- 既にトークンがある場合は既存を返す（再生成は `{"shop":"...","regenerate":true}`）。

---

## 7. 動作確認

1. **テストモード**で `stripe listen --forward-to localhost:3000/api/stripe/webhook` を使い、ローカルで checkout→webhook の疎通を確認。
2. 本番では、対象店舗の管理画面（手順6の URL）→「有料プランにアップグレード」→ Stripe Checkout で**1件テスト課金 → 即解約**し、以下を確認:
   - `/shops/<slug>` の公開ページに公式バッジ／写真枠が出る（PR2 の自動連動）。
   - 解約後、バッジが消える（`canceled` → 静的プランに戻る）。
3. 課金導線を一般公開する前に、**3ヶ月無料クーポンが実際に適用される**ことを必ず確認（手順2）。

---

## 関連実装（参考）

- 価格定義: `src/lib/data/plans.ts`
- 決済: `src/app/api/stripe/{checkout,webhook,portal}/route.ts`、`src/lib/stripe.ts`、`src/lib/stripe-env.ts`
- 実効プラン連動: `src/lib/shop-plan.ts`（`getEffectivePlan` / `getEffectivePlanMap`）、`src/app/api/shop-plan/route.ts`
- 認証/オンボーディング: `src/app/api/shop-auth/verify/route.ts`、`src/app/api/admin/shop-token/route.ts`
