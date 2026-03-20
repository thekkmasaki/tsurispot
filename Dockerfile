# ============================================
# Stage 1: 依存関係インストール
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ============================================
# Stage 2: ビルド
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド時に必要な環境変数（NEXT_PUBLIC_* はビルド時に埋め込まれる）
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_LINE_ADD_FRIEND_URL
ARG MICROCMS_SERVICE_DOMAIN
ARG MICROCMS_API_KEY

ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_LINE_ADD_FRIEND_URL=$NEXT_PUBLIC_LINE_ADD_FRIEND_URL
ENV MICROCMS_SERVICE_DOMAIN=$MICROCMS_SERVICE_DOMAIN
ENV MICROCMS_API_KEY=$MICROCMS_API_KEY

# メモリ上限を増やしてビルド（5,000+ページのSSG）
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm run build

# ============================================
# Stage 3: 本番イメージ（最小構成）
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# セキュリティ: non-rootユーザーで実行
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# public フォルダ（画像・favicon等）
COPY --from=builder /app/public ./public

# standalone出力（サーバー本体）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 静的アセット（CSS/JS）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
