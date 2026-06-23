// 会員ストアのファサード。USER_STORE_MODE で redis / dual / dynamo を切替える。
//  - redis (既定): 既存どおり Upstash Redis。本番挙動を変えない。
//  - dual: 書き込みを Redis と DynamoDB の両方へ（バックフィル期間の二重書き込み）。読みは Redis（移行元が正）。
//  - dynamo: 読み書きとも DynamoDB（切替後）。
// 呼び出し側は `@/lib/auth-redis` を `@/lib/user-store` に差し替えるだけでよい（同一シグネチャ）。

import * as redis from "@/lib/auth-redis";
import * as dynamo from "./dynamo";

export type {
  TsuriSpotUser,
  StyleTag,
  Checkin,
  StoredPushSubscription,
} from "@/lib/auth-redis";
export { STYLE_TAGS } from "@/lib/auth-redis";

type Mode = "redis" | "dual" | "dynamo";
const MODE: Mode = ((): Mode => {
  const m = (process.env.USER_STORE_MODE || "").toLowerCase();
  return m === "dual" || m === "dynamo" ? m : "redis";
})();

/** 現在のモード（デバッグ・ヘルスチェック用） */
export const userStoreMode: Mode = MODE;

// 読み取りは primary（dynamo モードのみ DynamoDB、それ以外は Redis）
const read = MODE === "dynamo" ? dynamo : redis;

// 書き込みラッパ。dual は両方へ書き、Redis（移行元の正）の結果を返す。
function w<A extends unknown[], R>(
  rfn: (...a: A) => Promise<R>,
  dfn: (...a: A) => Promise<R>,
): (...a: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    if (MODE === "redis") return rfn(...args);
    if (MODE === "dynamo") return dfn(...args);
    const [r] = await Promise.all([rfn(...args), dfn(...args)]);
    return r;
  };
}

// ---- 読み取り ----
export const getUserById = read.getUserById;
export const getUserByProvider = read.getUserByProvider;
export const getUserFavorites = read.getUserFavorites;
export const isFollowing = read.isFollowing;
export const getFollowingCount = read.getFollowingCount;
export const getFollowersCount = read.getFollowersCount;
export const getFollowingList = read.getFollowingList;
export const getFollowersList = read.getFollowersList;
export const isInWishlist = read.isInWishlist;
export const getWishlist = read.getWishlist;
export const getWishMemo = read.getWishMemo;
export const getCheckins = read.getCheckins;
export const getPushSubscriptions = read.getPushSubscriptions;

// ---- 書き込み（dual は Redis/DynamoDB 両方へ）----
export const createUser = w(redis.createUser, dynamo.createUser);
export const updateNickname = w(redis.updateNickname, dynamo.updateNickname);
export const updateProfile = w(redis.updateProfile, dynamo.updateProfile);
export const updateAvatarUrl = w(redis.updateAvatarUrl, dynamo.updateAvatarUrl);
export const deleteUser = w(redis.deleteUser, dynamo.deleteUser);
export const incrementReportCount = w(
  redis.incrementReportCount,
  dynamo.incrementReportCount,
);
export const decrementReportCount = w(
  redis.decrementReportCount,
  dynamo.decrementReportCount,
);
export const incrementContributionCount = w(
  redis.incrementContributionCount,
  dynamo.incrementContributionCount,
);
export const setUserFavorites = w(
  redis.setUserFavorites,
  dynamo.setUserFavorites,
);
export const follow = w(redis.follow, dynamo.follow);
export const unfollow = w(redis.unfollow, dynamo.unfollow);
export const addToWishlist = w(redis.addToWishlist, dynamo.addToWishlist);
export const removeFromWishlist = w(
  redis.removeFromWishlist,
  dynamo.removeFromWishlist,
);
export const setWishMemo = w(redis.setWishMemo, dynamo.setWishMemo);
export const addCheckin = w(redis.addCheckin, dynamo.addCheckin);
export const removeCheckin = w(redis.removeCheckin, dynamo.removeCheckin);
export const savePushSubscription = w(
  redis.savePushSubscription,
  dynamo.savePushSubscription,
);
export const removePushSubscription = w(
  redis.removePushSubscription,
  dynamo.removePushSubscription,
);
