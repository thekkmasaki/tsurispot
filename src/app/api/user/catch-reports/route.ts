import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/auth-redis";
import { toWebpUrl } from "@/lib/s3";

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

  // S3画像をWebP URLに変換
  for (const r of reports) {
    if (r.photoUrl) r.photoUrl = toWebpUrl(r.photoUrl);
  }

  const user = await getUserById(userId);
  const reportCount = user?.reportCount ?? reports.length;

  return NextResponse.json({ reports, reportCount });
}
