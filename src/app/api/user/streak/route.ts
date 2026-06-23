import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getCheckins } from "@/lib/user-store";
import { calculateStreak, buildDailyCounts } from "@/lib/streak";

interface CatchReportLite {
  date?: string;
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // チェックイン（プライベート釣行記録）
  const checkins = await getCheckins(userId, 365);
  const checkinDates = checkins.map((c) => c.date).filter(Boolean) as string[];

  // 釣果投稿
  const reportsRaw = await redis.lrange(`auth:user_reports:${userId}`, 0, 499);
  const reports = (reportsRaw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as CatchReportLite;
        } catch {
          return null;
        }
      }
      return item as CatchReportLite;
    })
    .filter((r): r is CatchReportLite => Boolean(r));
  const reportDates = reports.map((r) => r.date).filter(Boolean) as string[];

  const allDates = [...checkinDates, ...reportDates];
  const streak = calculateStreak(allDates);
  const dailyCounts = buildDailyCounts(allDates);

  return NextResponse.json({
    streak,
    dailyCounts,
  });
}
