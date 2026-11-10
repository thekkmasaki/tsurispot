import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getRequestUser, unauthorizedResponse } from "@/lib/app-link/request-user";
import { getUserById } from "@/lib/user-store";

// GET: 認証ユーザーの投稿した釣果一覧を取得
export async function GET(request: Request) {
  const ru = await getRequestUser(request);
  if (ru.kind === "unauthorized") return unauthorizedResponse();
  const userId = ru.kind === "user" ? ru.user.tsuriId : undefined;
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
