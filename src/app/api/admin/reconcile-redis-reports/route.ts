import { NextRequest, NextResponse } from "next/server";
import { dbGet } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { fishingSpots } from "@/lib/data/spots";

interface CatchReport {
  id: string;
  spotSlug: string;
  spotName?: string;
  fishName?: string;
  userName?: string;
  tsuriId?: string;
  comment?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
  submittedAt?: string;
}

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_RECONCILE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_RECONCILE_TOKEN 環境変数が未設定" },
      { status: 500 },
    );
  }
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/, "");
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let scannedReports = 0;
  let pushedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  const byUser = new Map<string, CatchReport[]>();

  for (const spot of fishingSpots) {
    try {
      const reports = await dbGet<CatchReport[]>(
        `SPOT#${spot.slug}`,
        "UGC_REPORTS",
      );
      if (!reports || reports.length === 0) continue;
      scannedReports += reports.length;
      for (const r of reports) {
        if (!r.tsuriId) continue;
        if (!byUser.has(r.tsuriId)) byUser.set(r.tsuriId, []);
        byUser.get(r.tsuriId)!.push(r);
      }
    } catch (err) {
      errors.push(`spot:${spot.slug}: ${String(err)}`);
    }
  }

  for (const [tsuriId, reports] of byUser) {
    try {
      const raw = await redis.lrange<string>(
        `auth:user_reports:${tsuriId}`,
        0,
        -1,
      );
      const existingIds = new Set<string>();
      for (const item of raw) {
        try {
          const p = typeof item === "string" ? JSON.parse(item) : item;
          if (p?.id) existingIds.add(p.id);
        } catch {
          // ignore parse error
        }
      }

      reports.sort((a, b) =>
        (b.submittedAt ?? b.date ?? "").localeCompare(
          a.submittedAt ?? a.date ?? "",
        ),
      );

      for (const r of reports) {
        if (existingIds.has(r.id)) {
          skippedCount++;
          continue;
        }
        await redis.lpush(
          `auth:user_reports:${tsuriId}`,
          JSON.stringify(r),
        );
        existingIds.add(r.id);
        pushedCount++;
      }
      await redis.ltrim(`auth:user_reports:${tsuriId}`, 0, 999);
    } catch (err) {
      errors.push(`user:${tsuriId}: ${String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    scannedSpots: fishingSpots.length,
    scannedReports,
    uniqueUsers: byUser.size,
    pushedCount,
    skippedCount,
    errorCount: errors.length,
    errors: errors.slice(0, 10),
  });
}
