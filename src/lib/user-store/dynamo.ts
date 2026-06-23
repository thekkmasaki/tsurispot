// DynamoDB 版の会員ストア。src/lib/auth-redis.ts と同一シグネチャ・同一セマンティクスを
// DynamoDB（単一テーブル tsurispot、pk/sk/data/ttl）で実装する。
// 型は auth-redis.ts を単一の真実として import する（再定義しない）。
//
// データモデル（GSIは増やさない・per-userパーティション＋Query/Scanで賄う）:
//  ユーザー        pk=USER#{id}            sk=PROFILE            data=TsuriSpotUser
//  お気に入り      pk=USER#{id}            sk=FAVORITES         data=string[]
//  フォロー件数    pk=USER#{id}            sk=FOLLOWING_COUNT   data=number
//  フォロワー件数  pk=USER#{id}            sk=FOLLOWERS_COUNT   data=number
//  プロバイダ写像  pk=AUTHPROVIDER#{p}#{pid} sk=MAP             data=userId
//  フォロー        pk=FOLLOWING#{id}       sk=MEMBER#{otherId}  data={ts,id}
//  フォロワー      pk=FOLLOWERS#{id}       sk=MEMBER#{otherId}  data={ts,id}
//  ウィッシュ      pk=WISH#{id}            sk=ITEM#{slug}       data={ts,slug}
//  ウィッシュメモ  pk=WISH#{id}            sk=MEMO#{slug}       data=string
//  チェックイン    pk=CHECKIN#{id}         sk=CK#{createdAt}#{cid} data=Checkin
//  Push購読        pk=PUSHSUB#{id}         sk=ENDPOINT#{endpoint} data=StoredPushSubscription
//  会員数カウンタ  pk=STATS                sk=USER_COUNT        data=number

import {
  dbGet,
  dbPut,
  dbDelete,
  dbIncr,
  dbDecr,
  dbExists,
  dbConditionalPut,
  dbQuery,
} from "@/lib/dynamodb";
import type {
  TsuriSpotUser,
  Checkin,
  StoredPushSubscription,
} from "@/lib/auth-redis";

// ---- キー組み立て ----
const userPk = (id: string) => `USER#${id}`;
const providerPk = (provider: string, providerId: string) =>
  `AUTHPROVIDER#${provider}#${providerId}`;
const followingPk = (id: string) => `FOLLOWING#${id}`;
const followersPk = (id: string) => `FOLLOWERS#${id}`;
const wishPk = (id: string) => `WISH#${id}`;
const checkinPk = (id: string) => `CHECKIN#${id}`;
const pushPk = (id: string) => `PUSHSUB#${id}`;

const PROFILE = "PROFILE";
const FAVORITES = "FAVORITES";
const FOLLOWING_COUNT = "FOLLOWING_COUNT";
const FOLLOWERS_COUNT = "FOLLOWERS_COUNT";
const memberSk = (id: string) => `MEMBER#${id}`;
const wishItemSk = (slug: string) => `ITEM#${slug}`;
const wishMemoSk = (slug: string) => `MEMO#${slug}`;

const STATS_PK = "STATS";
const USER_COUNT_SK = "USER_COUNT";

// ================= ユーザー =================

export async function getUserById(
  userId: string,
): Promise<TsuriSpotUser | null> {
  return (await dbGet<TsuriSpotUser>(userPk(userId), PROFILE)) ?? null;
}

export async function getUserByProvider(
  provider: string,
  providerId: string,
): Promise<TsuriSpotUser | null> {
  const userId = await dbGet<string>(providerPk(provider, providerId), "MAP");
  if (!userId) return null;
  return getUserById(userId);
}

/** SETNX 相当: provider mapping を取れた時だけ user データを書く。会員数カウンタも加算。 */
export async function createUser(user: TsuriSpotUser): Promise<void> {
  const acquired = await dbConditionalPut(
    providerPk(user.provider, user.providerId),
    "MAP",
    user.id,
  );
  if (acquired) {
    await dbPut(userPk(user.id), PROFILE, user);
    await dbIncr(STATS_PK, USER_COUNT_SK);
  }
}

export async function updateNickname(
  userId: string,
  nickname: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  await dbPut(userPk(userId), PROFILE, {
    ...user,
    nickname,
    nicknameSetAt: new Date().toISOString(),
  });
  return true;
}

export async function updateProfile(
  userId: string,
  patch: {
    nickname?: string;
    bio?: string;
    headerImage?: string;
    isPublic?: boolean;
    bestCatchId?: string;
    styles?: string[];
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
    ...(patch.bestCatchId !== undefined ? { bestCatchId: patch.bestCatchId } : {}),
    ...(patch.styles !== undefined ? { styles: patch.styles } : {}),
  };
  await dbPut(userPk(userId), PROFILE, updated);
  return updated;
}

export async function updateAvatarUrl(
  userId: string,
  avatarUrl: string,
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  await dbPut(userPk(userId), PROFILE, { ...user, avatarUrl });
  return true;
}

/** アカウント削除（フォロー双方向 cleanup ＋ 会員数カウンタ減算）。 */
export async function deleteUser(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;

  try {
    const followings = await getFollowingList(userId, 1000);
    await Promise.all(
      followings.map((f) => dbDelete(followersPk(f), memberSk(userId))),
    );
    const followers = await getFollowersList(userId, 1000);
    await Promise.all(
      followers.map((f) => dbDelete(followingPk(f), memberSk(userId))),
    );
    // 自分側のフォロー/フォロワーのメンバーアイテムも掃除
    const myFollowing = await dbQuery<{ ts: number; id: string }>(
      followingPk(userId),
      { skPrefix: "MEMBER#", all: true },
    );
    const myFollowers = await dbQuery<{ ts: number; id: string }>(
      followersPk(userId),
      { skPrefix: "MEMBER#", all: true },
    );
    await Promise.all([
      ...myFollowing.map((it) => dbDelete(followingPk(userId), it.sk)),
      ...myFollowers.map((it) => dbDelete(followersPk(userId), it.sk)),
    ]);
  } catch {
    /* 失敗しても削除は続行 */
  }

  await dbDelete(userPk(userId), PROFILE);
  await dbDelete(providerPk(user.provider, user.providerId), "MAP");
  await dbDelete(userPk(userId), FAVORITES);
  await dbDelete(userPk(userId), FOLLOWING_COUNT);
  await dbDelete(userPk(userId), FOLLOWERS_COUNT);
  await dbDecr(STATS_PK, USER_COUNT_SK);
  return true;
}

export async function incrementReportCount(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = (user.reportCount || 0) + 1;
  await dbPut(userPk(userId), PROFILE, { ...user, reportCount: count });
  return count;
}

export async function decrementReportCount(userId: string): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = Math.max(0, (user.reportCount || 0) - 1);
  await dbPut(userPk(userId), PROFILE, { ...user, reportCount: count });
  return count;
}

export async function incrementContributionCount(
  userId: string,
): Promise<number> {
  const user = await getUserById(userId);
  if (!user) return 0;
  const count = (user.contributionCount || 0) + 1;
  await dbPut(userPk(userId), PROFILE, { ...user, contributionCount: count });
  return count;
}

// ================= お気に入り =================

export async function getUserFavorites(userId: string): Promise<string[]> {
  return (await dbGet<string[]>(userPk(userId), FAVORITES)) || [];
}

export async function setUserFavorites(
  userId: string,
  slugs: string[],
): Promise<void> {
  await dbPut(userPk(userId), FAVORITES, slugs);
}

// ================= フォロー =================

export async function follow(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false;
  const target = await getUserById(followeeId);
  if (!target) return false;
  const ts = Date.now();
  // 既存でなければ作成（カウンタ二重加算を防ぐため acquired を見る）
  const created = await dbConditionalPut(
    followingPk(followerId),
    memberSk(followeeId),
    { ts, id: followeeId },
  );
  await dbConditionalPut(followersPk(followeeId), memberSk(followerId), {
    ts,
    id: followerId,
  });
  if (created) {
    await dbIncr(userPk(followerId), FOLLOWING_COUNT);
    await dbIncr(userPk(followeeId), FOLLOWERS_COUNT);
  }
  return true;
}

export async function unfollow(
  followerId: string,
  followeeId: string,
): Promise<void> {
  const existed = await dbExists(followingPk(followerId), memberSk(followeeId));
  await dbDelete(followingPk(followerId), memberSk(followeeId));
  await dbDelete(followersPk(followeeId), memberSk(followerId));
  if (existed) {
    await dbDecr(userPk(followerId), FOLLOWING_COUNT);
    await dbDecr(userPk(followeeId), FOLLOWERS_COUNT);
  }
}

export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false;
  return dbExists(followingPk(followerId), memberSk(followeeId));
}

export async function getFollowingCount(userId: string): Promise<number> {
  return (await dbGet<number>(userPk(userId), FOLLOWING_COUNT)) || 0;
}

export async function getFollowersCount(userId: string): Promise<number> {
  return (await dbGet<number>(userPk(userId), FOLLOWERS_COUNT)) || 0;
}

export async function getFollowingList(
  userId: string,
  limit = 50,
): Promise<string[]> {
  const items = await dbQuery<{ ts: number; id: string }>(followingPk(userId), {
    skPrefix: "MEMBER#",
    all: true,
  });
  return items
    .map((i) => i.data)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((d) => d.id);
}

export async function getFollowersList(
  userId: string,
  limit = 50,
): Promise<string[]> {
  const items = await dbQuery<{ ts: number; id: string }>(followersPk(userId), {
    skPrefix: "MEMBER#",
    all: true,
  });
  return items
    .map((i) => i.data)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((d) => d.id);
}

// ================= 行きたいスポット =================

export async function addToWishlist(
  userId: string,
  slug: string,
): Promise<void> {
  await dbPut(wishPk(userId), wishItemSk(slug), { ts: Date.now(), slug });
}

export async function removeFromWishlist(
  userId: string,
  slug: string,
): Promise<void> {
  await dbDelete(wishPk(userId), wishItemSk(slug));
  await dbDelete(wishPk(userId), wishMemoSk(slug));
}

export async function isInWishlist(
  userId: string,
  slug: string,
): Promise<boolean> {
  return dbExists(wishPk(userId), wishItemSk(slug));
}

export async function getWishlist(
  userId: string,
  limit = 100,
): Promise<string[]> {
  const items = await dbQuery<{ ts: number; slug: string }>(wishPk(userId), {
    skPrefix: "ITEM#",
    all: true,
  });
  return items
    .map((i) => i.data)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((d) => d.slug);
}

export async function getWishMemo(
  userId: string,
  slug: string,
): Promise<string> {
  return (await dbGet<string>(wishPk(userId), wishMemoSk(slug))) || "";
}

export async function setWishMemo(
  userId: string,
  slug: string,
  memo: string,
): Promise<void> {
  if (!memo) {
    await dbDelete(wishPk(userId), wishMemoSk(slug));
    return;
  }
  await dbPut(wishPk(userId), wishMemoSk(slug), memo);
}

// ================= チェックイン =================

const checkinSk = (c: Checkin) => `CK#${c.createdAt}#${c.id}`;

export async function addCheckin(
  userId: string,
  checkin: Checkin,
): Promise<void> {
  await dbPut(checkinPk(userId), checkinSk(checkin), checkin);
  // 最新100件を保持（古いものを削除＝Redis ltrim 相当）
  const all = await dbQuery<Checkin>(checkinPk(userId), {
    skPrefix: "CK#",
    forward: false,
    all: true,
  });
  if (all.length > 100) {
    const toDelete = all.slice(100); // 降順なので index100以降が古い
    await Promise.all(
      toDelete.map((it) => dbDelete(checkinPk(userId), it.sk)),
    );
  }
}

export async function getCheckins(
  userId: string,
  limit = 50,
): Promise<Checkin[]> {
  const items = await dbQuery<Checkin>(checkinPk(userId), {
    skPrefix: "CK#",
    forward: false,
    limit,
  });
  return items.map((i) => i.data);
}

export async function removeCheckin(
  userId: string,
  checkinId: string,
): Promise<boolean> {
  const all = await dbQuery<Checkin>(checkinPk(userId), {
    skPrefix: "CK#",
    all: true,
  });
  const target = all.find((i) => i.data?.id === checkinId);
  if (!target) return false;
  await dbDelete(checkinPk(userId), target.sk);
  return true;
}

// ================= Push購読 =================

const endpointSk = (endpoint: string) => `ENDPOINT#${endpoint}`;

export async function savePushSubscription(
  userId: string,
  sub: StoredPushSubscription,
): Promise<void> {
  await dbPut(pushPk(userId), endpointSk(sub.endpoint), sub);
}

export async function removePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  await dbDelete(pushPk(userId), endpointSk(endpoint));
}

export async function getPushSubscriptions(
  userId: string,
): Promise<StoredPushSubscription[]> {
  const items = await dbQuery<StoredPushSubscription>(pushPk(userId), {
    skPrefix: "ENDPOINT#",
    all: true,
  });
  return items.map((i) => i.data);
}
