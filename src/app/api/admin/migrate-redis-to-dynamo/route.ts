import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
// 移行元（Redis）の読み取りは auth-redis を直接 import（ファサードのモードに依存しない）
import {
  getUserById,
  getUserFavorites,
  getFollowingList,
  getFollowersList,
  getWishlist,
  getWishMemo,
  getCheckins,
  getPushSubscriptions,
} from "@/lib/auth-redis";
// 移行先（DynamoDB）への書き込みは dynamo 実装を直接 import
import {
  importUserBundle,
  setUserCount,
  type UserBundle,
} from "@/lib/user-store/dynamo";

export const runtime = "nodejs";
export const maxDuration = 300;

const USER_PREFIX = "auth:user:";

// POST /api/admin/migrate-redis-to-dynamo?mode=dry|execute
//  - Authorization: Bearer <ADMIN_MIGRATE_TOKEN>
//  - 既定 mode=dry（書き込まず件数のみ）。mode=execute で DynamoDB へ投入。
//  - Redis(auth:user:*) を SCAN → 各ユーザーの全ドメインを読み → importUserBundle で投入。
//    会員/ソーシャルデータのみ（釣果フィードの auth:user_reports / recent_reports:global は別route）。
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_MIGRATE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_MIGRATE_TOKEN 環境変数が未設定" },
      { status: 500 },
    );
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const execute = new URL(request.url).searchParams.get("mode") === "execute";

  // 1) auth:user:* を SCAN で全件収集
  const userIds: string[] = [];
  try {
    let cursor = "0";
    let guard = 0;
    do {
      const res = (await redis.scan(cursor, {
        match: `${USER_PREFIX}*`,
        count: 500,
      })) as [string, string[]] | null;
      if (!res) {
        return NextResponse.json(
          { error: "Redis に接続できません（UPSTASH未設定 もしくはリクエスト上限到達）" },
          { status: 503 },
        );
      }
      const [next, keys] = res;
      cursor = String(next);
      for (const k of keys) userIds.push(k.slice(USER_PREFIX.length));
      if (++guard > 2000) break; // 暴走防止
    } while (cursor !== "0");
  } catch (e) {
    return NextResponse.json(
      { error: `SCAN失敗: ${String((e as Error).message)}` },
      { status: 500 },
    );
  }

  const stats = {
    mode: execute ? "execute" : "dry",
    usersScanned: userIds.length,
    migrated: 0,
    favorites: 0,
    following: 0,
    followers: 0,
    wishlist: 0,
    memos: 0,
    checkins: 0,
    pushSubs: 0,
    errors: [] as string[],
  };

  const baseTs = Date.now();

  for (const id of userIds) {
    try {
      const user = await getUserById(id);
      if (!user) continue;

      const favorites = await getUserFavorites(id);
      const followingIds = await getFollowingList(id, 100000);
      const followerIds = await getFollowersList(id, 100000);
      const wishSlugs = await getWishlist(id, 100000);
      const checkins = await getCheckins(id, 100000);
      const pushSubs = await getPushSubscriptions(id);

      const memos: { slug: string; memo: string }[] = [];
      for (const slug of wishSlugs) {
        const memo = await getWishMemo(id, slug);
        if (memo) memos.push({ slug, memo });
      }

      // 順序保持: newest-first の配列を ts 降順に対応づけ（index 0 = 最新 = 最大ts）
      const following = followingIds.map((fid, i) => ({ id: fid, ts: baseTs - i }));
      const followers = followerIds.map((fid, i) => ({ id: fid, ts: baseTs - i }));
      const wishlist = wishSlugs.map((slug, i) => ({ slug, ts: baseTs - i }));

      if (favorites.length) stats.favorites += 1;
      stats.following += following.length;
      stats.followers += followers.length;
      stats.wishlist += wishlist.length;
      stats.memos += memos.length;
      stats.checkins += checkins.length;
      stats.pushSubs += pushSubs.length;

      if (execute) {
        const bundle: UserBundle = {
          user,
          favorites,
          following,
          followers,
          wishlist,
          memos,
          checkins,
          pushSubs,
        };
        await importUserBundle(bundle);
      }
      stats.migrated += 1;
    } catch (e) {
      stats.errors.push(`${id}: ${String((e as Error).message)}`);
    }
  }

  if (execute) {
    await setUserCount(stats.migrated);
  }

  return NextResponse.json({ ok: stats.errors.length === 0, ...stats });
}
