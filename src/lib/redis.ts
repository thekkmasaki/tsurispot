import { Redis } from "@upstash/redis";

// Upstash Redis クライアント（遅延初期化）
// ビルド時のモジュール評価でRedisが初期化されるのを防ぐ
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  if (url && url.startsWith("https://") && token && token.length > 10) {
    try {
      _redis = new Redis({ url, token });
      return _redis;
    } catch {
      return null;
    }
  }
  return null;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const instance = getRedis();
    if (!instance) {
      // Redis未設定時はすべてのメソッド呼び出しでnull/0を返す
      return () => Promise.resolve(null);
    }
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});
