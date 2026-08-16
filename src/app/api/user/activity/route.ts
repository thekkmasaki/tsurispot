import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

/**
 * 活動記録の同期（案②）。匿名時に localStorage へ貯めた訪問日/アクション日を
 * ログイン後にサーバー側へ反映する。SADD なので何度呼んでも union になる。
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DATES = 400;

function sanitize(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((d): d is string => typeof d === "string" && DATE_RE.test(d))
    .slice(-MAX_DATES);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  let body: { visits?: unknown; actions?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  const visits = sanitize(body.visits);
  const actions = sanitize(body.actions);

  const ops: Promise<unknown>[] = [];
  if (visits.length > 0) {
    ops.push(redis.sadd(`auth:visits:${userId}`, visits[0], ...visits.slice(1)));
  }
  if (actions.length > 0) {
    ops.push(
      redis.sadd(`auth:actions:${userId}`, actions[0], ...actions.slice(1)),
    );
  }
  await Promise.all(ops);

  return NextResponse.json({ ok: true, visits: visits.length, actions: actions.length });
}
