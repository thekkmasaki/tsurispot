import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

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
