import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

interface CatchReport {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  sizeCm?: number;
  method?: string;
  photoUrl?: string;
}

function parseReports(raw: unknown[]): CatchReport[] {
  return (raw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as CatchReport;
        } catch {
          return null;
        }
      }
      return item as CatchReport;
    })
    .filter((r): r is CatchReport => Boolean(r));
}

function getSeason(monthNum: number): "spring" | "summer" | "autumn" | "winter" {
  if (monthNum >= 3 && monthNum <= 5) return "spring";
  if (monthNum >= 6 && monthNum <= 8) return "summer";
  if (monthNum >= 9 && monthNum <= 11) return "autumn";
  return "winter";
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 999);
  const reports = parseReports(raw as unknown[]);

  // 魚種別最大サイズ
  const maxByFish: Record<string, CatchReport> = {};
  for (const r of reports) {
    if (!r.fishName || typeof r.sizeCm !== "number") continue;
    const prev = maxByFish[r.fishName];
    if (!prev || (r.sizeCm > (prev.sizeCm ?? 0))) {
      maxByFish[r.fishName] = r;
    }
  }
  const fishRecords = Object.values(maxByFish)
    .sort((a, b) => (b.sizeCm ?? 0) - (a.sizeCm ?? 0))
    .slice(0, 10);

  // 全体最大魚
  const overallBest = fishRecords[0] ?? null;

  // 初挑戦魚種 (新しい順、最初の日付)
  const firstCatchByFish: Record<string, CatchReport> = {};
  for (const r of reports) {
    if (!r.fishName || !r.date) continue;
    const existing = firstCatchByFish[r.fishName];
    if (!existing || (existing.date && r.date < existing.date)) {
      firstCatchByFish[r.fishName] = r;
    }
  }
  const firstChallenges = Object.values(firstCatchByFish)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 5);

  // 季節別ベスト
  const seasonBest: Record<string, CatchReport | null> = {
    spring: null,
    summer: null,
    autumn: null,
    winter: null,
  };
  for (const r of reports) {
    if (!r.date || typeof r.sizeCm !== "number") continue;
    const month = parseInt(r.date.slice(5, 7), 10);
    if (!month) continue;
    const season = getSeason(month);
    const prev = seasonBest[season];
    if (!prev || (r.sizeCm > (prev.sizeCm ?? 0))) {
      seasonBest[season] = r;
    }
  }

  // 最も釣ったスポット TOP3
  const spotCount: Record<string, { count: number; spotSlug: string; spotName: string }> = {};
  for (const r of reports) {
    if (!r.spotSlug || !r.spotName) continue;
    if (!spotCount[r.spotSlug]) {
      spotCount[r.spotSlug] = { count: 0, spotSlug: r.spotSlug, spotName: r.spotName };
    }
    spotCount[r.spotSlug].count++;
  }
  const topSpots = Object.values(spotCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return NextResponse.json({
    totalReports: reports.length,
    overallBest,
    fishRecords,
    firstChallenges,
    seasonBest,
    topSpots,
  });
}
