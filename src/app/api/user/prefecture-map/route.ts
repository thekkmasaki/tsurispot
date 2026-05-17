import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { prefectures } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";

interface CatchReport {
  spotSlug?: string;
  fishName?: string;
  date?: string;
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

  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 999);
  const reports = parseReports(raw as unknown[]);

  // spotSlug → prefecture map
  const spotToPref = new Map<string, string>();
  for (const s of fishingSpots) {
    spotToPref.set(s.slug, s.region.prefecture);
  }

  // ユーザの釣果から都道府県別カウント
  const prefCounts: Record<string, number> = {};
  for (const r of reports) {
    if (!r.spotSlug) continue;
    const pref = spotToPref.get(r.spotSlug);
    if (!pref) continue;
    prefCounts[pref] = (prefCounts[pref] || 0) + 1;
  }

  const list = prefectures.map((p) => ({
    slug: p.slug,
    name: p.name,
    nameShort: p.nameShort,
    regionGroup: p.regionGroup,
    visited: (prefCounts[p.name] || 0) > 0,
    catchCount: prefCounts[p.name] || 0,
  }));

  const visitedCount = list.filter((p) => p.visited).length;

  return NextResponse.json({
    total: list.length,
    visitedCount,
    completionRate: Math.round((visitedCount / list.length) * 100),
    prefectures: list,
  });
}
