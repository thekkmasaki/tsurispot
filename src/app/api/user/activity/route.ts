import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { todayJST } from "@/lib/activity";

/**
 * 活動記録の同期（案②）。匿名時に localStorage へ貯めた訪問日/アクション日を
 * ログイン後にサーバー側へ反映する。SADD なので何度呼んでも union になる。
 * 受け入れるのは「実在する日付・過去400日以内・未来でない」もののみ
 * （端末時計ズレによる未来日の混入はストリークを current=0 に壊すため弾く）。
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DATES = 400;

function isRealDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function sanitize(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const today = todayJST();
  const min = new Date(Date.now() - MAX_DATES * 86400000)
    .toISOString()
    .slice(0, 10);
  return input
    .filter(
      (d): d is string =>
        typeof d === "string" &&
        DATE_RE.test(d) &&
        isRealDate(d) &&
        d <= today &&
        d >= min,
    )
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
