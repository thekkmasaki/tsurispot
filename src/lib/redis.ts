import { Redis } from "@upstash/redis";

// Upstash Redis クライアント
// .trim() で環境変数の空白/改行を除去（Vercel設定時のコピペ問題を回避）
const redisUrl = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();

// Redis未設定時もビルドが通るようにダミーインスタンスを作成
function createRedis() {
  if (redisUrl && redisUrl.startsWith("https://") && redisToken && redisToken.length > 10) {
    try {
      return new Redis({ url: redisUrl, token: redisToken });
    } catch {
      return null as unknown as Redis;
    }
  }
  // ビルド時やローカル開発で未設定の場合はダミー
  // API側で process.env.UPSTASH_REDIS_REST_URL チェック済みなので実際には使われない
  return null as unknown as Redis;
}

export const redis = createRedis();
