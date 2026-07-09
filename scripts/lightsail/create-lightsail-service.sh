#!/usr/bin/env bash
# Lightsail コンテナサービスを作成し、ECR からのプルを許可する。
# デプロイ自体は GitHub Actions の deploy-lightsail.yml が行うため、ここでは「箱」を用意するだけ。
#
# 実行環境: Lightsail 作成権限を持つプリンシパルで（CloudShell 等）。
# 実行: bash create-lightsail-service.sh
set -euo pipefail

SERVICE_NAME="tsurispot"
REGION="ap-northeast-1"
POWER="large"   # 2 vCPU / 8GB。medium×2 は L1 キャッシュ分裂のため不可（large×1 で確定）
SCALE="1"
ECR_REPO_ARN="arn:aws:ecr:${REGION}:179503922406:repository/tsurispot"

echo "1) Lightsail コンテナサービス $SERVICE_NAME ($POWER × $SCALE) を作成..."
aws lightsail create-container-service \
  --service-name "$SERVICE_NAME" \
  --power "$POWER" \
  --scale "$SCALE" \
  --region "$REGION" >/dev/null 2>&1 \
  && echo "   作成しました" \
  || echo "   既に存在（スキップ）"

echo "2) サービスが READY になるまで待機..."
for i in $(seq 1 40); do
  STATE=$(aws lightsail get-container-services --service-name "$SERVICE_NAME" --region "$REGION" \
    --query 'containerServices[0].state' --output text)
  echo "   state=$STATE"
  case "$STATE" in READY|RUNNING|ACTIVE) break ;; esac
  sleep 15
done

echo "3) ECR プライベートリポジトリからのプルを許可..."
aws lightsail update-container-service \
  --service-name "$SERVICE_NAME" \
  --region "$REGION" \
  --private-registry-access "ecrImagePullerRole={isActive=true}" >/dev/null
# Lightsail が発行する ecrImagePullerRole の principal を ECR リポジトリポリシーに許可する必要がある。
PRINCIPAL=$(aws lightsail get-container-services --service-name "$SERVICE_NAME" --region "$REGION" \
  --query 'containerServices[0].privateRegistryAccess.ecrImagePullerRole.principalArn' --output text)
echo "   ecrImagePullerRole principal: $PRINCIPAL"

echo "4) ECR リポジトリポリシーに Lightsail のプル権限を付与..."
cat > /tmp/ecr-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLightsailPull",
      "Effect": "Allow",
      "Principal": { "AWS": "$PRINCIPAL" },
      "Action": ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
    }
  ]
}
EOF
aws ecr set-repository-policy \
  --repository-name tsurispot \
  --region "$REGION" \
  --policy-text file:///tmp/ecr-policy.json >/dev/null
echo "   付与しました"

URL=$(aws lightsail get-container-services --service-name "$SERVICE_NAME" --region "$REGION" \
  --query 'containerServices[0].url' --output text)
echo ""
echo "✅ Lightsail サービス作成完了。"
echo "   直 URL: $URL"
echo "   次: GitHub Actions の 'Deploy to Lightsail (manual)' を実行 → 直 URL で検証"
