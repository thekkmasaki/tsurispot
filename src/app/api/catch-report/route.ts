import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const DAILY_LIMIT_KEY = "daily_cmd_count";
const MAX_DAILY_COMMANDS = 8000;

async function checkDailyLimit(): Promise<boolean> {
  try {
    const count = await redis.get<number>(DAILY_LIMIT_KEY);
    return (count ?? 0) < MAX_DAILY_COMMANDS;
  } catch {
    return true;
  }
}

async function incrementDailyCount(cmds: number) {
  try {
    const exists = await redis.exists(DAILY_LIMIT_KEY);
    await redis.incrby(DAILY_LIMIT_KEY, cmds);
    if (!exists) {
      await redis.expire(DAILY_LIMIT_KEY, 86400);
    }
  } catch {
    // ignore
  }
}

// GET: スポットの釣果報告数を取得
export async function GET(request: Request) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ count: 0 });
    }
    if (!(await checkDailyLimit())) {
      return NextResponse.json({ count: 0 });
    }

    const { searchParams } = new URL(request.url);
    const spotSlug = searchParams.get("spot");
    if (!spotSlug || spotSlug.length > 100) {
      return NextResponse.json({ error: "invalid spot" }, { status: 400 });
    }

    const key = `catch:${spotSlug}`;
    const count = (await redis.get<number>(key)) ?? 0;
    await incrementDailyCount(2);

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: 釣果報告を送信（1ユーザー1スポット1日1回まで）
export async function POST(request: Request) {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ ok: true, count: 0 });
    }
    if (!(await checkDailyLimit())) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const body = await request.json().catch(() => ({}));
    const { spotSlug, sessionId } = body as { spotSlug?: string; sessionId?: string };

    if (!spotSlug || typeof spotSlug !== "string" || spotSlug.length > 100) {
      return NextResponse.json({ error: "invalid spotSlug" }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 60) {
      return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
    }

    // 連打防止: 1セッション1スポットにつき24時間に1回
    const rateLimitKey = `catch_limit:${sessionId}:${spotSlug}`;
    const alreadyReported = await redis.get(rateLimitKey);
    if (alreadyReported) {
      return NextResponse.json({ ok: false, error: "already_reported", count: (await redis.get<number>(`catch:${spotSlug}`)) ?? 0 });
    }

    // カウントをインクリメント
    const key = `catch:${spotSlug}`;
    const newCount = await redis.incr(key);

    // レート制限キーを設定（24時間TTL）
    await redis.set(rateLimitKey, 1, { ex: 86400 });

    await incrementDailyCount(5);

    return NextResponse.json({ ok: true, count: newCount });
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
