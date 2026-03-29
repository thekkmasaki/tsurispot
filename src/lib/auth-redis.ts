import { redis } from "@/lib/redis";

export interface TsuriSpotUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  createdAt: string;
  reportCount?: number;
  nicknameSetAt?: string;
}

const USER_PREFIX = "auth:user:";
const PROVIDER_PREFIX = "auth:provider:";

/**
 * Redisから取得した値を確実にオブジェクトにする。
 * 二重シリアライズ（文字列として保存）された旧データにも対応。
 * 壊れたデータを検出したら正しい形式で再保存する。
 */
async function parseUser(key: string, val: unknown): Promise<TsuriSpotUser | null> {
  if (val === null || val === undefined) return null;

  let user: TsuriSpotUser;

  if (typeof val === "string") {
    // 二重シリアライズ検出 → パースして正しい形式で再保存
    try {
      user = JSON.parse(val) as TsuriSpotUser;
    } catch {
      console.error(`[auth-redis] Failed to parse user data for key: ${key}`);
      return null;
    }
    // 正しい形式で上書き保存（次回以降のパース不要にする）
    try {
      await redis.set(key, user);
      console.log(`[auth-redis] Fixed double-serialized data: ${key}`);
    } catch {
      // 書き込み失敗しても読み取りは続行
    }
    return user;
  }

  if (typeof val === "object") {
    return val as TsuriSpotUser;
  }

  return null;
}

/** プロバイダーIDからユーザーを検索 */
export async function getUserByProvider(
  provider: string,
  providerId: string,
): Promise<TsuriSpotUser | null> {
  try {
    const raw = await redis.get(`${PROVIDER_PREFIX}${provider}:${providerId}`);
    // provider mapping の値は userId 文字列
    const userId = typeof raw === "string" ? raw : null;
    if (!userId) return null;

    const key = `${USER_PREFIX}${userId}`;
    const userRaw = await redis.get(key);
    return await parseUser(key, userRaw);
  } catch (err) {
    console.error("[auth-redis] getUserByProvider failed:", err);
    return null;
  }
}

/** UUIDからユーザーを取得 */
export async function getUserById(
  userId: string,
): Promise<TsuriSpotUser | null> {
  try {
    const key = `${USER_PREFIX}${userId}`;
    const userRaw = await redis.get(key);
    return await parseUser(key, userRaw);
  } catch (err) {
    console.error("[auth-redis] getUserById failed:", err);
    return null;
  }
}

/** 新規ユーザー作成 */
export async function createUser(user: TsuriSpotUser): Promise<void> {
  await redis.set(`${USER_PREFIX}${user.id}`, user);
  await redis.set(
    `${PROVIDER_PREFIX}${user.provider}:${user.providerId}`,
    user.id,
  );
}

/** ニックネーム更新 */
export async function updateNickname(
  userId: string,
  nickname: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  const updated = { ...user, nickname, nicknameSetAt: new Date().toISOString() };
  await redis.set(`${USER_PREFIX}${userId}`, updated);
  return true;
}

/** アバターURL更新 */
export async function updateAvatarUrl(
  userId: string,
  avatarUrl: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  const updated = { ...user, avatarUrl };
  await redis.set(`${USER_PREFIX}${userId}`, updated);
  return true;
}

/** アカウント削除 */
export async function deleteUser(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  await redis.del(`${USER_PREFIX}${userId}`);
  await redis.del(
    `${PROVIDER_PREFIX}${user.provider}:${user.providerId}`,
  );
  await redis.del(`auth:favorites:${userId}`);
  await redis.del(`auth:user_reports:${userId}`);
  await redis.del(`auth:user_photos:${userId}`);
  return true;
}

/** reportCount を+1 */
export async function incrementReportCount(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = (user.reportCount || 0) + 1;
  const updated = { ...user, reportCount: count };
  await redis.set(`${USER_PREFIX}${userId}`, updated);
  return count;
}

/** reportCount を-1（最小0） */
export async function decrementReportCount(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = Math.max(0, (user.reportCount || 0) - 1);
  const updated = { ...user, reportCount: count };
  await redis.set(`${USER_PREFIX}${userId}`, updated);
  return count;
}

/** お気に入り取得 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  return (await redis.get<string[]>(`auth:favorites:${userId}`)) || [];
}

/** お気に入り保存 */
export async function setUserFavorites(
  userId: string,
  slugs: string[],
): Promise<void> {
  await redis.set(`auth:favorites:${userId}`, slugs);
}
