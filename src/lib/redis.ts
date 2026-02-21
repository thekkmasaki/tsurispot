import { Redis } from "@upstash/redis";

// Upstash Redis クライアント（環境変数から自動設定）
// UPSTASH_REDIS_REST_URL と UPSTASH_REDIS_REST_TOKEN をVercel環境変数に設定
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});
