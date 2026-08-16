import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getCheckins } from "@/lib/user-store";
import { calculateStreak } from "@/lib/streak";
import { buildActivityLevels, countByLevel, maxTripsInAnyMonth } from "@/lib/activity";

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

  // 訪問日 (Lv1) / アクション日 (Lv2)。匿名時に貯めた分は /api/user/activity 経由で union 済み
  const [visitsRaw, actionsRaw] = await Promise.all([
    redis.smembers(`auth:visits:${userId}`),
    redis.smembers(`auth:actions:${userId}`),
  ]);
  const visitDates = (visitsRaw || []).filter(
    (d): d is string => typeof d === "string",
  );
  const actionDates = (actionsRaw || []).filter(
    (d): d is string => typeof d === "string",
  );

  // ハイブリッド定義: 見た=1 / 動いた=2 / 行った=3（同日は最大レベル）
  const tripDates = [...checkinDates, ...reportDates];
  const levels = buildActivityLevels(visitDates, actionDates, tripDates);
  const streak = calculateStreak(Object.keys(levels));

  return NextResponse.json({
    streak,
    // 値は件数ではなくレベル (1-3)。CalendarHeatmap の色分け (1/2/3+) にそのまま渡せる
    dailyCounts: levels,
    levelCounts: countByLevel(levels),
    maxTripsInMonth: maxTripsInAnyMonth(levels),
  });
}
