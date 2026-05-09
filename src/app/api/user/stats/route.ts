import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/auth-redis";

interface CatchReport {
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
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

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 499);
  const reports = parseReports(raw as unknown[]);

  const user = await getUserById(userId);
  const reportCount = user?.reportCount ?? reports.length;

  const uniqueFish = new Set(reports.map((r) => r.fishName).filter(Boolean) as string[]);
  const uniqueSpots = new Set(reports.map((r) => r.spotSlug).filter(Boolean) as string[]);
  const uniqueDates = new Set(reports.map((r) => r.date).filter(Boolean) as string[]);
  const uniqueMethods = new Set(reports.map((r) => r.method).filter(Boolean) as string[]);

  const sizes = reports
    .map((r) => r.sizeCm)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;
  const photoCount = reports.filter((r) => r.photoUrl).length;

  const maxByFish: Record<string, number> = {};
  reports.forEach((r) => {
    if (r.fishName && typeof r.sizeCm === "number") {
      maxByFish[r.fishName] = Math.max(maxByFish[r.fishName] || 0, r.sizeCm);
    }
  });

  return NextResponse.json({
    reportCount,
    uniqueFishCount: uniqueFish.size,
    uniqueSpotCount: uniqueSpots.size,
    fishingDayCount: uniqueDates.size,
    uniqueMethodCount: uniqueMethods.size,
    maxSizeCm: maxSize,
    photoCount,
    maxByFish,
  });
}
