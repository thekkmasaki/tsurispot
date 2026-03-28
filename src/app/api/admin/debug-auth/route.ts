import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// GET /api/admin/debug-auth?secret=xxx
// Redisの認証データをダンプして根本原因を調査
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. auth:provider:line:* のキーをスキャン
    const providerKeys: string[] = [];
    let cursor = 0;
    for (let i = 0; i < 10; i++) {
      const result = await (redis as unknown as { scan: (cursor: number, opts: Record<string, unknown>) => Promise<[number, string[]]> })
        .scan(cursor, { match: "auth:provider:line:*", count: 100 });
      const [nextCursor, keys] = result;
      providerKeys.push(...keys);
      cursor = nextCursor;
      if (cursor === 0) break;
    }

    // 2. 各マッピングの値（tsuriId）を取得
    const mappings: Record<string, string | null> = {};
    for (const key of providerKeys) {
      const value = await redis.get<string>(key);
      mappings[key] = value;
    }

    // 3. auth:user:* のキーをスキャン
    const userKeys: string[] = [];
    cursor = 0;
    for (let i = 0; i < 10; i++) {
      const result = await (redis as unknown as { scan: (cursor: number, opts: Record<string, unknown>) => Promise<[number, string[]]> })
        .scan(cursor, { match: "auth:user:*", count: 100 });
      const [nextCursor, keys] = result;
      userKeys.push(...keys);
      cursor = nextCursor;
      if (cursor === 0) break;
    }

    // 4. 各ユーザーのデータを取得
    const users: Record<string, unknown> = {};
    for (const key of userKeys) {
      const value = await redis.get(key);
      users[key] = value;
    }

    return NextResponse.json({
      providerMappings: {
        count: providerKeys.length,
        keys: providerKeys,
        values: mappings,
      },
      users: {
        count: userKeys.length,
        keys: userKeys,
        data: users,
      },
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({
      error: "Failed to scan Redis",
      message: String(e),
    }, { status: 500 });
  }
}
