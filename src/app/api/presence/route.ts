import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const PRESENCE_KEY = "active_users";
const TTL_SECONDS = 120; // 120秒で期限切れ（ハートビート60秒間隔の2倍）
const DAILY_LIMIT_KEY = "daily_cmd_count";
const MAX_DAILY_COMMANDS = 8000; // 無料枠10,000の80%で制限（安全マージン）

// 日次コマンド数チェック（超過時はRedis操作をスキップ）
async function checkDailyLimit(): Promise<boolean> {
  try {
    const count = await redis.get<number>(DAILY_LIMIT_KEY);
    return (count ?? 0) < MAX_DAILY_COMMANDS;
  } catch {
    return true; // エラー時は許可
  }
}

async function incrementDailyCount(cmds: number) {
  try {
    const exists = await redis.exists(DAILY_LIMIT_KEY);
    await redis.incrby(DAILY_LIMIT_KEY, cmds);
    if (!exists) {
      // 日本時間の深夜にリセットされるよう24時間TTL
      await redis.expire(DAILY_LIMIT_KEY, 86400);
    }
  } catch {
    // 無視
  }
}

// GET: アクティブユーザー数を取得
export async function GET() {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ count: 0 });
    }
    if (!(await checkDailyLimit())) {
      return NextResponse.json({ count: 0 }); // 上限到達時は0を返す
    }

    const now = Date.now();
    await redis.zremrangebyscore(PRESENCE_KEY, 0, now - TTL_SECONDS * 1000);
    const count = await redis.zcard(PRESENCE_KEY);
    await incrementDailyCount(3); // zremrangebyscore + zcard + incrby

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: ハートビート
export async function POST(request: Request) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ ok: true, count: 0 });
    }
    if (!(await checkDailyLimit())) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = (body as { sessionId?: string }).sessionId;
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 50) {
      return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
    }

    const now = Date.now();
    await redis.zadd(PRESENCE_KEY, { score: now, member: sessionId });
    await redis.zremrangebyscore(PRESENCE_KEY, 0, now - TTL_SECONDS * 1000);
    const count = await redis.zcard(PRESENCE_KEY);
    await incrementDailyCount(4); // zadd + zremrangebyscore + zcard + incrby

    return NextResponse.json({ ok: true, count });
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
