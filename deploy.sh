#!/bin/bash
# ツリスポ デプロイスクリプト
# 使い方: bash deploy.sh "コミットメッセージ"

set -e

MESSAGE="${1:-update}"

echo "🔨 .next キャッシュ削除..."
rm -rf .next

echo "🏗️ ビルド..."
npx next build

echo "📦 Git コミット..."
git add -A
git commit -m "$MESSAGE

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "🚀 GitHub にプッシュ..."
git push origin master

echo "🌐 Vercel にデプロイ..."
npx vercel --prod --yes

echo "✅ デプロイ完了！ https://tsurispot.com"
