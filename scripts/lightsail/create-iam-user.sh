#!/usr/bin/env bash
# Lightsail ランタイム用の最小権限 IAM ユーザーを作成し、アクセスキーを発行する。
# Lightsail Containers はインスタンスロール非対応のため、S3/DynamoDB/Rekognition への
# アクセスをこのユーザーのキーで行う（App Runner ではインスタンスロールが担っていた役割）。
#
# 実行環境: IAM 管理権限を持つプリンシパルで（例: AWS CloudShell を管理者アカウントで）。
#   ※ CI 用の tsurispot-deploy ユーザーには IAM 作成権限が無いため、これは手動実行が必要。
# 実行: bash create-iam-user.sh   （iam-runtime-policy.json と同じディレクトリで）
set -euo pipefail

USER_NAME="tsurispot-lightsail-runtime"
POLICY_NAME="tsurispot-lightsail-runtime-policy"
HERE="$(cd "$(dirname "$0")" && pwd)"
POLICY_FILE="$HERE/iam-runtime-policy.json"

[ -f "$POLICY_FILE" ] || { echo "iam-runtime-policy.json が見つからない: $POLICY_FILE" >&2; exit 1; }

echo "1) IAM ユーザー $USER_NAME を作成..."
aws iam create-user --user-name "$USER_NAME" >/dev/null 2>&1 \
  && echo "   作成しました" \
  || echo "   既に存在（スキップ）"

echo "2) 最小権限ポリシーをインラインで付与..."
aws iam put-user-policy \
  --user-name "$USER_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_FILE"
echo "   付与しました（S3 uploads+isr-cache / DynamoDB tsurispot / Rekognition DetectModerationLabels）"

echo "3) アクセスキーを発行..."
KEY_JSON=$(aws iam create-access-key --user-name "$USER_NAME")
AKID=$(echo "$KEY_JSON" | jq -r '.AccessKey.AccessKeyId')
SECRET=$(echo "$KEY_JSON" | jq -r '.AccessKey.SecretAccessKey')

OUT="$HOME/lightsail-runtime-key.env"
umask 077
cat > "$OUT" <<EOF
RUNTIME_AWS_ACCESS_KEY_ID=$AKID
RUNTIME_AWS_SECRET_ACCESS_KEY=$SECRET
EOF

echo ""
echo "✅ アクセスキーを $OUT (0600) に保存しました（画面には表示していません）。"
echo ""
echo "次の手順:"
echo "  A) GitHub Secrets に登録（gh CLI がある環境で）:"
echo "       source $OUT"
echo "       printf '%s' \"\$RUNTIME_AWS_ACCESS_KEY_ID\"     | gh secret set RUNTIME_AWS_ACCESS_KEY_ID     --repo thekkmasaki/tsurispot --body -"
echo "       printf '%s' \"\$RUNTIME_AWS_SECRET_ACCESS_KEY\" | gh secret set RUNTIME_AWS_SECRET_ACCESS_KEY --repo thekkmasaki/tsurispot --body -"
echo "  B) 登録後、鍵ファイルを消す:"
echo "       shred -u $OUT 2>/dev/null || rm -f $OUT"
