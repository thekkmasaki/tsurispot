import { redis } from "@/lib/redis";

export interface TsuriSpotUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  createdAt: string;
  reportCount?: number;
}

const USER_PREFIX = "auth:user:";
const PROVIDER_PREFIX = "auth:provider:";

/** プロバイダーIDからユーザーを検索 */
export async function getUserByProvider(
  provider: string,
  providerId: string,
): Promise<TsuriSpotUser | null> {
  const userId = await redis.get<string>(
    `${PROVIDER_PREFIX}${provider}:${providerId}`,
  );
  if (!userId) return null;
  return redis.get<TsuriSpotUser>(`${USER_PREFIX}${userId}`);
}

/** UUIDからユーザーを取得 */
export async function getUserById(
  userId: string,
): Promise<TsuriSpotUser | null> {
  return redis.get<TsuriSpotUser>(`${USER_PREFIX}${userId}`);
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
  user.nickname = nickname;
  await redis.set(`${USER_PREFIX}${userId}`, user);
  return true;
}

/** アバターURL更新 */
export async function updateAvatarUrl(
  userId: string,
  avatarUrl: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  user.avatarUrl = avatarUrl;
  await redis.set(`${USER_PREFIX}${userId}`, user);
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
  // お気に入り・写真・レポートも削除
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
  user.reportCount = count;
  await redis.set(`${USER_PREFIX}${userId}`, user);
  return count;
}

/** reportCount を-1（最小0） */
export async function decrementReportCount(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = Math.max(0, (user.reportCount || 0) - 1);
  user.reportCount = count;
  await redis.set(`${USER_PREFIX}${userId}`, user);
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
