#!/usr/bin/env bash
# App Runner の RuntimeEnvironmentVariables を GitHub Secrets へ移設する。
#
# なぜ必要か:
#  Lightsail は create-container-service-deployment でデプロイ定義をフル置換するため、
#  全ランタイム env を CI(GitHub Actions) から渡す必要がある。現状これらは App Runner
#  コンソール直設定で GitHub Secrets に無い。このスクリプトが両者の橋渡しをする。
#
# 安全性:
#  - env の値は標準出力に一切表示しない（describe-service → gh secret set へ直接パイプ）
#  - gh secret set は値を stdin から受け取るため、プロセス一覧やログにも残らない
#
# 前提: aws CLI(App Runner describe 権限) と gh CLI(対象 repo の secret 書込権限) がログイン済み。
# 実行: bash scripts/lightsail/migrate-env-to-gh-secrets.sh
set -euo pipefail

REPO="thekkmasaki/tsurispot"
SVC_ARN="arn:aws:apprunner:ap-northeast-1:179503922406:service/tsurispot/5a8d55c727a94c029c2666e7fc3b5108"

# Lightsail のランタイムに必要な env（App Runner 実稼働 29 個のうち、
# HOSTNAME/NODE_ENV=Docker が設定、ISR_CACHE_*=ワークフローでリテラル指定、を除く）。
KEYS=(
  ADMIN_RECONCILE_TOKEN AUTH_SECRET AUTH_TRUST_HOST AUTH_URL
  CF_API_TOKEN CF_ZONE_ID
  COGNITO_CLIENT_ID COGNITO_CLIENT_SECRET COGNITO_ISSUER
  GAS_CATCH_REPORT_URL
  LINE_CHANNEL_ACCESS_TOKEN LINE_CHANNEL_SECRET
  MICROCMS_API_KEY MICROCMS_SERVICE_DOMAIN
  NEXT_PUBLIC_VAPID_PUBLIC_KEY
  STRIPE_COUPON_BASIC STRIPE_COUPON_PRO STRIPE_PRICE_BASIC STRIPE_PRICE_PRO
  STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
  UPSTASH_REDIS_REST_TOKEN UPSTASH_REDIS_REST_URL
  VAPID_PRIVATE_KEY VAPID_SUBJECT
)

echo "App Runner から現行ランタイム env を取得中..."
ENV_JSON=$(aws apprunner describe-service --service-arn "$SVC_ARN" \
  --query 'Service.SourceConfiguration.ImageRepository.ImageConfiguration.RuntimeEnvironmentVariables' \
  --output json)

set_count=0
skip_count=0
for k in "${KEYS[@]}"; do
  # jq -e: キーが無ければ非ゼロ終了 → スキップ（値は表示しない）
  if val=$(jq -e -r --arg k "$k" '.[$k] // empty' <<<"$ENV_JSON") && [ -n "$val" ]; then
    printf '%s' "$val" | gh secret set "$k" --repo "$REPO" --body - >/dev/null
    echo "  set  $k"
    set_count=$((set_count + 1))
  else
    echo "  skip $k (App Runner に未設定)"
    skip_count=$((skip_count + 1))
  fi
  unset val
done

echo ""
echo "完了: ${set_count} 個を GitHub Secrets に登録、${skip_count} 個スキップ。"
echo ""
echo "★ 別途、手動で登録が必要な Secret（このスクリプトの対象外）:"
echo "   - RUNTIME_AWS_ACCESS_KEY_ID     : Lightsail 用 IAM ユーザーのアクセスキー ID"
echo "   - RUNTIME_AWS_SECRET_ACCESS_KEY : 同 シークレット"
echo "   （create-iam-user.sh で発行した値を gh secret set で登録）"
