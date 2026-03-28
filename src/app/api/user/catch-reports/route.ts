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
  if (!raw || raw.length === 0) {
    return NextResponse.json({ reports: [] });
  }

  const reports = raw
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item);
        } catch {
          // 旧形式（reportId のみ）はスキップ
          return null;
        }
      }
      // オブジェクトとして返ってくる場合（Upstash）
      return item;
    })
    .filter(Boolean);

  const user = await getUserById(userId);
  const reportCount = user?.reportCount || reports.length;

  return NextResponse.json({ reports, reportCount });
}
