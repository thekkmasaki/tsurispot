import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
// 現行本番のユーザー正はRedisのため、ファサードのモードに依存せず auth-redis を直接読む（migrate-redis-to-dynamoと同方針）
import { getUserById } from "@/lib/auth-redis";
import { updateUserSearchIndex } from "@/lib/social-store";

export const runtime = "nodejs";
export const maxDuration = 300;

const USER_PREFIX = "auth:user:";

// POST /api/admin/backfill-user-search?mode=dry|execute
//  - Authorization: Bearer <ADMIN_MIGRATE_TOKEN>
//  - 既存全ユーザーを USERSEARCH 索引へ投入（非公開プロフィールは除外される）
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_MIGRATE_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_MIGRATE_TOKEN 環境変数が未設定" }, { status: 500 });
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const execute = new URL(request.url).searchParams.get("mode") === "execute";

  const userIds: string[] = [];
  let cursor = "0";
  let guard = 0;
  do {
    const res = (await redis.scan(cursor, { match: `${USER_PREFIX}*`, count: 500 })) as
      | [string, string[]]
      | null;
    if (!res) {
      return NextResponse.json({ error: "Redis に接続できません" }, { status: 503 });
    }
    cursor = res[0];
    for (const key of res[1] ?? []) userIds.push(key.slice(USER_PREFIX.length));
  } while (cursor !== "0" && ++guard < 100);

  if (!execute) {
    return NextResponse.json({ mode: "dry", total: userIds.length, sample: userIds.slice(0, 5) });
  }

  let indexed = 0;
  let skipped = 0;
  for (const id of userIds) {
    const user = await getUserById(id);
    if (!user) {
      skipped++;
      continue;
    }
    try {
      await updateUserSearchIndex({
        tsuriId: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        reportCount: user.reportCount,
        isPublic: user.isPublic,
      });
      indexed++;
    } catch (err) {
      console.error(`[backfill-user-search] ${id} 索引エラー:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ mode: "execute", total: userIds.length, indexed, skipped });
}
