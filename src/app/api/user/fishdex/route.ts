import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { fishSpecies } from "@/lib/data/fish";

interface CatchReport {
  fishName?: string;
  sizeCm?: number;
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

  // ユーザが釣った魚名 (Set) + 各魚種の最大サイズ
  const caughtSet = new Set<string>();
  const maxByFish: Record<string, number> = {};
  const firstCatchByFish: Record<string, string> = {};
  for (const r of reports) {
    if (!r.fishName) continue;
    caughtSet.add(r.fishName);
    if (typeof r.sizeCm === "number" && r.sizeCm > (maxByFish[r.fishName] ?? 0)) {
      maxByFish[r.fishName] = r.sizeCm;
    }
    if (r.date) {
      const existing = firstCatchByFish[r.fishName];
      if (!existing || r.date < existing) {
        firstCatchByFish[r.fishName] = r.date;
      }
    }
  }

  const fish = fishSpecies.map((f) => ({
    slug: f.slug,
    name: f.name,
    imageUrl: `/images/fish/${f.slug}.jpg`,
    caught: caughtSet.has(f.name),
    maxSizeCm: maxByFish[f.name] ?? null,
    firstCaughtAt: firstCatchByFish[f.name] ?? null,
  }));

  const caughtCount = fish.filter((f) => f.caught).length;
  return NextResponse.json({
    total: fish.length,
    caughtCount,
    completionRate: Math.round((caughtCount / fish.length) * 100),
    fish,
  });
}
