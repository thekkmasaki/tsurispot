import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user-store";
import { splitFishNames } from "@/lib/fish-name";

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

  // 「アジ、サバ」のような複数魚種の投稿を魚種単位に分割して数える
  const uniqueFish = new Set(reports.flatMap((r) => splitFishNames(r.fishName)));
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
    if (typeof r.sizeCm !== "number") return;
    for (const name of splitFishNames(r.fishName)) {
      maxByFish[name] = Math.max(maxByFish[name] || 0, r.sizeCm);
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
