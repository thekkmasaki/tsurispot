# ============================================
# CI pre-built artifacts → 本番イメージ
# Next.jsビルドはCI側で実行済み（高速化のため）
# ============================================
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# 本番ランタイム用メモリ上限（4GBコンテナ向け）
ENV NODE_OPTIONS="--max-old-space-size=3072"

# セキュリティ: non-rootユーザーで実行
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# public フォルダ（画像・favicon等）
COPY public ./public

# standalone出力（サーバー本体）
COPY --chown=nextjs:nodejs .next/standalone ./
# 静的アセット（CSS/JS）
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
