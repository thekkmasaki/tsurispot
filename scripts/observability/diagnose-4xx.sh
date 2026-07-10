#!/usr/bin/env bash
# 4xx 急増の正体（404/401/429 とどのパス/UA か）を Cloudflare Analytics で特定する。
#
# 背景: 2026-07 に App Runner の 4xx が 4,334/日(7/6)→34,823/日(7/9) と加速。OOM(5xx)とは独立で
#   アプリログに出ない。App Runner メトリクスは 4xx をコード別に分けないため、エッジ(Cloudflare)で
#   status × path × UA を見て正体を掴む。
#
# 実行: CF_API_TOKEN と CF_ZONE_ID が env にある環境で（ローカル/CloudShell）。
#   例: export CF_API_TOKEN=... CF_ZONE_ID=...   # 値は tsurispot の Cloudflare トークン
#       bash scripts/observability/diagnose-4xx.sh 2026-07-08
set -euo pipefail

SINCE="${1:-$(date -u -d '2 days ago' +%Y-%m-%d 2>/dev/null || echo 2026-07-08)}"
: "${CF_API_TOKEN:?CF_API_TOKEN を環境変数に設定してください}"
: "${CF_ZONE_ID:?CF_ZONE_ID を環境変数に設定してください}"

echo "=== status code 別（${SINCE} 以降）==="
curl -s -X POST https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
  -d "{\"query\":\"query { viewer { zones(filter:{zoneTag:\\\"${CF_ZONE_ID}\\\"}) { httpRequestsAdaptiveGroups(limit:20, filter:{date_geq:\\\"${SINCE}\\\"}, orderBy:[count_DESC]) { count dimensions { edgeResponseStatus } } } } }\"}" \
  | jq -r '.data.viewer.zones[0].httpRequestsAdaptiveGroups[] | "\(.dimensions.edgeResponseStatus)\t\(.count)"'

echo ""
echo "=== 4xx の多いパス上位（clientRequestPath × status、${SINCE} 以降）==="
curl -s -X POST https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
  -d "{\"query\":\"query { viewer { zones(filter:{zoneTag:\\\"${CF_ZONE_ID}\\\"}) { httpRequestsAdaptiveGroups(limit:25, filter:{date_geq:\\\"${SINCE}\\\", edgeResponseStatus_geq:400, edgeResponseStatus_lt:500}, orderBy:[count_DESC]) { count dimensions { edgeResponseStatus clientRequestPath } } } } }\"}" \
  | jq -r '.data.viewer.zones[0].httpRequestsAdaptiveGroups[] | "\(.dimensions.edgeResponseStatus)\t\(.count)\t\(.dimensions.clientRequestPath)"'

echo ""
echo "解釈の目安:"
echo "  404多→クローラの死URL(旧slug等)。robots/redirect/sitemap是正で対処"
echo "  401多→認証(callbackrouteerror #248で診断性向上済み)。/api/auth系のパスを確認"
echo "  429多→レート制限。middleware/上流のレート設定を確認"
