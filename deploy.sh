#!/bin/bash
# ツリスポ デプロイスクリプト
# 使い方: bash deploy.sh "コミットメッセージ"
# masterにpush → GitHub Actions → ECR → App Runner 自動デプロイ

set -e

MESSAGE="${1:-update}"

echo "🔨 .next キャッシュ削除..."
rm -rf .next

echo "🏗️ ビルド..."
npx next build

echo "📦 Git コミット..."
git add -A
git commit -m "$MESSAGE"

echo "🚀 GitHub にプッシュ（App Runner 自動デプロイ開始）..."
git push origin master

echo "✅ push完了！ GitHub Actions → App Runner デプロイ中..."
echo "   https://github.com/thekkmasaki/tsurispot/actions"
