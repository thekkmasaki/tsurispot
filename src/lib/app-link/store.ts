import { createHash, randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import { safeEqual } from "@/lib/safe-compare";
import {
  CODE_TTL_SECONDS,
  MAX_TOKENS_PER_USER,
  TOKEN_PREFIX,
  TOKEN_RE,
  TOKEN_TTL_SECONDS,
  TOUCH_INTERVAL_MS,
} from "./config";

// 認可コード（60秒・1回きり）とアプリ用トークン（90日）の保存。
// どちらも平文では保存せず、sha256 の hex をキーにする。

const codeKey = (hash: string) => `auth:app_code:${hash}`;
const tokenKey = (hash: string) => `auth:app_token:${hash}`;
const userTokensKey = (tsuriId: string) => `auth:user_app_tokens:${tsuriId}`;

export const sha256hex = (s: string) => createHash("sha256").update(s).digest("hex");
export const sha256b64url = (s: string) => createHash("sha256").update(s).digest("base64url");
export const randomB64url = (bytes = 32) => randomBytes(bytes).toString("base64url");

interface CodeRecord {
  tsuriId: string;
  challenge: string;
  createdAt: string;
}

export interface AppTokenRecord {
  tsuriId: string;
  createdAt: string;
  lastSeenAt: string;
  deviceName: string | null;
}

function parseRecord<T>(raw: unknown): T | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  return typeof raw === "object" ? (raw as T) : null;
}

/** 認可コードを発行して保存する（60秒）。返り値は平文コード（アプリへ渡す分）。 */
export async function issueAuthCode(tsuriId: string, challenge: string): Promise<string> {
  const code = randomB64url(32);
  const rec: CodeRecord = { tsuriId, challenge, createdAt: new Date().toISOString() };
  await redis.set(codeKey(sha256hex(code)), rec, { ex: CODE_TTL_SECONDS });
  return code;
}

/**
 * コードを1回だけ引き換える。取り出しと削除は Redis の GETDEL で原子的に行うため、
 * verifier が不一致でもコードは消費される（総当たり不可・並行使用でも勝者は1つ）。
 * 無い・期限切れ・使用済み・verifier 不一致はすべて null（区別しない）。
 */
export async function redeemAuthCode(code: string, verifier: string): Promise<string | null> {
  const raw = await redis.getdel(codeKey(sha256hex(code)));
  const rec = parseRecord<CodeRecord>(raw);
  if (!rec || typeof rec.tsuriId !== "string" || typeof rec.challenge !== "string") return null;
  if (!safeEqual(sha256b64url(verifier), rec.challenge)) return null;
  return rec.tsuriId;
}

/** トークンを発行する。1人 MAX_TOKENS_PER_USER 個まで（超えたら古いものから失効）。 */
export async function createAppToken(tsuriId: string, deviceName: string | null): Promise<string> {
  const token = TOKEN_PREFIX + randomB64url(32);
  const hash = sha256hex(token);
  const now = new Date().toISOString();
  const rec: AppTokenRecord = { tsuriId, createdAt: now, lastSeenAt: now, deviceName };
  await redis.set(tokenKey(hash), rec, { ex: TOKEN_TTL_SECONDS });
  await redis.sadd(userTokensKey(tsuriId), hash);
  await redis.expire(userTokensKey(tsuriId), TOKEN_TTL_SECONDS);
  await enforceTokenLimit(tsuriId);
  return token;
}

async function enforceTokenLimit(tsuriId: string): Promise<void> {
  const members = ((await redis.smembers(userTokensKey(tsuriId))) ?? []) as string[];
  if (members.length <= MAX_TOKENS_PER_USER) return;
  const raws = (await redis.mget(...members.map(tokenKey))) as unknown[];
  const entries = members.map((hash, i) => {
    const rec = parseRecord<AppTokenRecord>(raws?.[i]);
    // 実体が既に期限切れのもの（rec なし）は 0 扱いで真っ先に掃除される
    return { hash, createdAt: rec ? Date.parse(rec.createdAt) || 0 : 0 };
  });
  entries.sort((a, b) => a.createdAt - b.createdAt);
  const excess = entries.slice(0, entries.length - MAX_TOKENS_PER_USER);
  for (const e of excess) {
    await redis.del(tokenKey(e.hash));
    await redis.srem(userTokensKey(tsuriId), e.hash);
  }
}

export interface VerifiedAppToken {
  tsuriId: string;
  hash: string;
}

/** トークンを検証する。無効なら null。lastSeenAt が24時間より古い時だけ更新して期限を90日に延ばす。 */
export async function verifyAppToken(token: string): Promise<VerifiedAppToken | null> {
  if (!TOKEN_RE.test(token)) return null;
  const hash = sha256hex(token);
  const rec = parseRecord<AppTokenRecord>(await redis.get(tokenKey(hash)));
  if (!rec || typeof rec.tsuriId !== "string") return null;

  const last = Date.parse(rec.lastSeenAt) || 0;
  if (Date.now() - last > TOUCH_INTERVAL_MS) {
    try {
      await redis.set(
        tokenKey(hash),
        { ...rec, lastSeenAt: new Date().toISOString() },
        { ex: TOKEN_TTL_SECONDS },
      );
      await redis.expire(userTokensKey(rec.tsuriId), TOKEN_TTL_SECONDS);
    } catch (err) {
      console.error("[app-link] lastSeenAt 更新エラー:", err);
    }
  }
  return { tsuriId: rec.tsuriId, hash };
}

/** 1つのトークンを失効させる。 */
export async function revokeAppToken(tsuriId: string, hash: string): Promise<void> {
  await redis.del(tokenKey(hash));
  await redis.srem(userTokensKey(tsuriId), hash);
}

/** その人のトークンを全部失効させる（退会・利用停止時）。 */
export async function revokeAllAppTokens(tsuriId: string): Promise<void> {
  const members = ((await redis.smembers(userTokensKey(tsuriId))) ?? []) as string[];
  for (const hash of members) await redis.del(tokenKey(hash));
  await redis.del(userTokensKey(tsuriId));
}
