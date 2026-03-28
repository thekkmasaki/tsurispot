import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/auth-redis";

// GET: 認証ユーザーの投稿した釣果一覧を取得
export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 49);
  const reports = (raw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      }
      return item;
    })
    .filter(Boolean);

  const user = await getUserById(userId);
  const reportCount = user?.reportCount ?? reports.length;

  return NextResponse.json({ reports, reportCount });
}

// PATCH: reportCount を手動設定（管理用）
export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { reportCount } = body as { reportCount?: number };

  if (typeof reportCount !== "number" || reportCount < 0) {
    return NextResponse.json({ error: "reportCount は0以上の数値" }, { status: 400 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  user.reportCount = reportCount;
  await redis.set(`auth:user:${userId}`, user);

  return NextResponse.json({ ok: true, reportCount });
}
