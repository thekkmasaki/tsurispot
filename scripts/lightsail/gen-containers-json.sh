#!/usr/bin/env bash
# containers.json を生成する（Lightsail create-container-service-deployment 用）。
# Lightsail は App Runner と違いデプロイ定義をフル置換するため、全ランタイム env を毎回記述する。
#
# 使い方: gen-containers-json.sh <image-uri> <out-file>
#   env: 下記 REQUIRED の全キー（GitHub Secrets からワークフローが渡す）
#
# 設計:
#  - 秘密値はコマンドライン引数に一切載せない（jq が env から直接読む＝ログ露出防止）
#  - 必須 env が1つでも空なら fail（未登録 Secret による「起動はするが機能欠落」を防ぐ）
set -euo pipefail

IMAGE_URI="${1:?usage: gen-containers-json.sh <image-uri> <out-file>}"
OUT="${2:?usage: gen-containers-json.sh <image-uri> <out-file>}"

# App Runner 実稼働の 29 env のうち、HOSTNAME/NODE_ENV(Docker が設定) と
# ISR_CACHE_*(下でリテラル指定) を除いた「Secrets から渡す」キー群 + 新規 AWS キー。
REQUIRED=(
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
  AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
)

missing=()
for k in "${REQUIRED[@]}"; do
  [ -n "${!k:-}" ] || missing+=("$k")
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "::error::以下のランタイム env(GitHub Secrets) が未設定です: ${missing[*]}" >&2
  echo "  → scripts/lightsail/migrate-env-to-gh-secrets.sh で App Runner から移設してください" >&2
  exit 1
fi

# OPTIONAL: 設定されていれば含める（未設定でも fail しない）。現状 App Runner にも無いが、
# 移行を機に有効化しうるもの: origin lockdown(CDNバイパス防御) と管理系トークン。
OPTIONAL=(
  ORIGIN_VERIFY_SECRET ORIGIN_LOCKDOWN_MODE
  ADMIN_SECRET ADMIN_MIGRATE_TOKEN
)
KEYS=("${REQUIRED[@]}")
for k in "${OPTIONAL[@]}"; do
  [ -n "${!k:-}" ] && KEYS+=("$k")
done

# jq が env.<KEY> で値を読む。REQUIRED+設定済みOPTIONAL を環境オブジェクトに畳み込み、
# リテラル(ISR_CACHE_* / AWS_REGION / AWS_S3_BUCKET / NODE_OPTIONS)を付与する。
export REQUIRED_KEYS_JSON
REQUIRED_KEYS_JSON=$(printf '%s\n' "${KEYS[@]}" | jq -R . | jq -s .)

jq -n --arg image "$IMAGE_URI" --argjson keys "$REQUIRED_KEYS_JSON" '
  {
    tsurispot: {
      image: $image,
      command: [],
      ports: { "3000": "HTTP" },
      environment: (
        (reduce $keys[] as $k ({}; . + { ($k): env[$k] }))
        + {
            "ISR_CACHE_BACKEND": "s3",
            "ISR_CACHE_S3_BUCKET": "tsurispot-isr-cache",
            "AWS_REGION": "ap-northeast-1",
            "AWS_S3_BUCKET": "tsurispot-uploads",
            "NODE_OPTIONS": "--max-old-space-size=5120"
          }
      )
    }
  }
' > "$OUT"

echo "generated $OUT (image=$IMAGE_URI, env=$(jq '.tsurispot.environment | length' "$OUT") keys)"
