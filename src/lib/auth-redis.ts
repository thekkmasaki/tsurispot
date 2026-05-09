import { redis } from "@/lib/redis";

export interface TsuriSpotUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  upstreamProvider?: string;
  bio?: string;
  headerImage?: string;
  isPublic?: boolean;
  createdAt: string;
  reportCount?: number;
  nicknameSetAt?: string;
}

const USER_PREFIX = "auth:user:";
const PROVIDER_PREFIX = "auth:provider:";
const FOLLOWING_PREFIX = "auth:following:";
const FOLLOWERS_PREFIX = "auth:followers:";
const WISHLIST_PREFIX = "wish:list:";
const WISH_MEMO_PREFIX = "wish:memo:";

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

/**
 * 新規ユーザー作成。SETNX で provider mapping を取得できた時だけ user データを書く。
 * 並行する2リクエストが同じ providerId で createUser を呼んでも、片方しか作成されない。
 */
export async function createUser(user: TsuriSpotUser): Promise<void> {
  const providerKey = `${PROVIDER_PREFIX}${user.provider}:${user.providerId}`;
  const acquired = await redis.set(providerKey, user.id, { nx: true });
  if (acquired) {
    await redis.set(`${USER_PREFIX}${user.id}`, user);
  }
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

/** プロフィール一括更新（nickname / bio / headerImage / isPublic を任意指定） */
export async function updateProfile(
  userId: string,
  patch: {
    nickname?: string;
    bio?: string;
    headerImage?: string;
    isPublic?: boolean;
  },
): Promise<TsuriSpotUser | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  const updated: TsuriSpotUser = {
    ...user,
    ...(patch.nickname !== undefined
      ? { nickname: patch.nickname, nicknameSetAt: new Date().toISOString() }
      : {}),
    ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
    ...(patch.headerImage !== undefined ? { headerImage: patch.headerImage } : {}),
    ...(patch.isPublic !== undefined ? { isPublic: patch.isPublic } : {}),
  };
  await redis.set(`${USER_PREFIX}${userId}`, updated);
  return updated;
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

/** アカウント削除（フォロー関連も双方向にクリーンアップ） */
export async function deleteUser(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;

  // フォロー関連の双方向 cleanup（最大1000件まで）
  try {
    const followings = await getFollowingList(userId, 1000);
    await Promise.all(
      followings.map((followee) =>
        redis.zrem(`${FOLLOWERS_PREFIX}${followee}`, userId),
      ),
    );
    const followers = await getFollowersList(userId, 1000);
    await Promise.all(
      followers.map((follower) =>
        redis.zrem(`${FOLLOWING_PREFIX}${follower}`, userId),
      ),
    );
  } catch {
    /* 失敗しても削除は続行 */
  }

  await redis.del(`${USER_PREFIX}${userId}`);
  await redis.del(`${PROVIDER_PREFIX}${user.provider}:${user.providerId}`);
  await redis.del(`auth:favorites:${userId}`);
  await redis.del(`auth:user_reports:${userId}`);
  await redis.del(`auth:user_photos:${userId}`);
  await redis.del(`${FOLLOWING_PREFIX}${userId}`);
  await redis.del(`${FOLLOWERS_PREFIX}${userId}`);
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

/** フォロー（自分→相手） */
export async function follow(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false;
  const target = await getUserById(followeeId);
  if (!target) return false;
  const ts = Date.now();
  await redis.zadd(`${FOLLOWING_PREFIX}${followerId}`, { score: ts, member: followeeId });
  await redis.zadd(`${FOLLOWERS_PREFIX}${followeeId}`, { score: ts, member: followerId });
  return true;
}

/** アンフォロー */
export async function unfollow(
  followerId: string,
  followeeId: string,
): Promise<void> {
  await redis.zrem(`${FOLLOWING_PREFIX}${followerId}`, followeeId);
  await redis.zrem(`${FOLLOWERS_PREFIX}${followeeId}`, followerId);
}

/** フォローしているか */
export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false;
  const score = await redis.zscore(`${FOLLOWING_PREFIX}${followerId}`, followeeId);
  return score !== null && score !== undefined;
}

/** フォロー中の人数 */
export async function getFollowingCount(userId: string): Promise<number> {
  return (await redis.zcard(`${FOLLOWING_PREFIX}${userId}`)) || 0;
}

/** フォロワー人数 */
export async function getFollowersCount(userId: string): Promise<number> {
  return (await redis.zcard(`${FOLLOWERS_PREFIX}${userId}`)) || 0;
}

/** フォロー中ユーザーID（新しい順、最大 limit 件） */
export async function getFollowingList(
  userId: string,
  limit = 50,
): Promise<string[]> {
  const members = await redis.zrange(
    `${FOLLOWING_PREFIX}${userId}`,
    0,
    limit - 1,
    { rev: true },
  );
  return (members as string[]) || [];
}

/** フォロワーID（新しい順、最大 limit 件） */
export async function getFollowersList(
  userId: string,
  limit = 50,
): Promise<string[]> {
  const members = await redis.zrange(
    `${FOLLOWERS_PREFIX}${userId}`,
    0,
    limit - 1,
    { rev: true },
  );
  return (members as string[]) || [];
}

/** 行きたいスポットに追加 */
export async function addToWishlist(userId: string, slug: string): Promise<void> {
  await redis.zadd(`${WISHLIST_PREFIX}${userId}`, {
    score: Date.now(),
    member: slug,
  });
}

/** 行きたいスポットから削除 */
export async function removeFromWishlist(userId: string, slug: string): Promise<void> {
  await redis.zrem(`${WISHLIST_PREFIX}${userId}`, slug);
  await redis.del(`${WISH_MEMO_PREFIX}${userId}:${slug}`);
}

/** 行きたいスポットに含まれるか */
export async function isInWishlist(userId: string, slug: string): Promise<boolean> {
  const score = await redis.zscore(`${WISHLIST_PREFIX}${userId}`, slug);
  return score !== null && score !== undefined;
}

/** 行きたいスポット slug 配列（追加が新しい順） */
export async function getWishlist(userId: string, limit = 100): Promise<string[]> {
  const members = await redis.zrange(
    `${WISHLIST_PREFIX}${userId}`,
    0,
    limit - 1,
    { rev: true },
  );
  return (members as string[]) || [];
}

/** 行きたいスポットのメモ取得 */
export async function getWishMemo(userId: string, slug: string): Promise<string> {
  const memo = await redis.get<string>(`${WISH_MEMO_PREFIX}${userId}:${slug}`);
  return memo || "";
}

/** 行きたいスポットのメモ保存（空文字は削除） */
export async function setWishMemo(
  userId: string,
  slug: string,
  memo: string,
): Promise<void> {
  if (!memo) {
    await redis.del(`${WISH_MEMO_PREFIX}${userId}:${slug}`);
    return;
  }
  await redis.set(`${WISH_MEMO_PREFIX}${userId}:${slug}`, memo);
}
