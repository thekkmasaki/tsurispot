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

  // 過去12ヶ月の月別釣果数 (yyyy-mm)
  const now = new Date();
  const monthly: { month: string; count: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({ month: ym, count: 0, label: `${d.getMonth() + 1}月` });
  }
  for (const r of reports) {
    if (!r.date) continue;
    const ym = r.date.slice(0, 7);
    const slot = monthly.find((m) => m.month === ym);
    if (slot) slot.count++;
  }

  // 魚種別 TOP10
  const fishCount: Record<string, number> = {};
  for (const r of reports) {
    if (!r.fishName) continue;
    fishCount[r.fishName] = (fishCount[r.fishName] || 0) + 1;
  }
  const byFish = Object.entries(fishCount)
    .map(([fishName, count]) => ({ fishName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // スポット別 TOP10
  const spotCount: Record<string, { count: number; spotSlug: string; spotName: string }> = {};
  for (const r of reports) {
    if (!r.spotSlug || !r.spotName) continue;
    if (!spotCount[r.spotSlug]) {
      spotCount[r.spotSlug] = { count: 0, spotSlug: r.spotSlug, spotName: r.spotName };
    }
    spotCount[r.spotSlug].count++;
  }
  const bySpot = Object.values(spotCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 釣法別
  const methodCount: Record<string, number> = {};
  for (const r of reports) {
    if (!r.method) continue;
    methodCount[r.method] = (methodCount[r.method] || 0) + 1;
  }
  const byMethod = Object.entries(methodCount)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // サイズ推移 (date+sizeCm を昇順、最新50件)
  const sizeTrend = reports
    .filter((r): r is CatchReport & { date: string; sizeCm: number; fishName: string } =>
      Boolean(r.date && typeof r.sizeCm === "number" && r.fishName),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-50)
    .map((r) => ({
      date: r.date,
      sizeCm: r.sizeCm,
      fishName: r.fishName,
    }));

  return NextResponse.json({
    monthly,
    byFish,
    bySpot,
    byMethod,
    sizeTrend,
    totalReports: reports.length,
  });
}
