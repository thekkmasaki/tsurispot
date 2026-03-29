import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/auth-redis";

// GET: 認証デバッグ情報（テスト用）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // ADMIN_SECRET or 開発環境のみ許可
  const isLocal = process.env.NODE_ENV === "development";
  const isAuthorized = secret && secret === process.env.ADMIN_SECRET;
  if (!isLocal && !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  // Redisの auth:provider:line:* キーを探す
  const providerKeys: string[] = [];
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(Number(cursor), {
      match: "auth:provider:line:*",
      count: 100,
    });
    cursor = String(nextCursor);
    providerKeys.push(...keys);
  } while (cursor !== "0");

  // 各キーの値を取得
  const mappings: Record<string, unknown> = {};
  for (const key of providerKeys) {
    const userId = await redis.get(key);
    mappings[key] = userId;
    if (typeof userId === "string") {
      const user = await redis.get(`auth:user:${userId}`);
      mappings[`auth:user:${userId}`] = user;
    }
  }

  return NextResponse.json({
    session: session
      ? {
          tsuriId: session.user?.tsuriId,
          nickname: session.user?.nickname,
          provider: session.user?.provider,
        }
      : null,
    providerMappings: mappings,
    providerKeyCount: providerKeys.length,
  });
}

// PATCH: ユーザーデータ修復（開発環境のみ）
export async function PATCH(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }
  const { userId, nickname } = await request.json();
  if (!userId || !nickname) {
    return NextResponse.json({ error: "userId and nickname required" }, { status: 400 });
  }
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const updated = { ...user, nickname };
  await redis.set(`auth:user:${userId}`, updated);
  return NextResponse.json({ ok: true, updated });
}
