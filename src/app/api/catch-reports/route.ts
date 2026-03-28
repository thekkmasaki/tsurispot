import { NextResponse } from "next/server";
import { getCatchReportsBySpot, type CatchReport } from "@/lib/data/catch-reports";
import { redis } from "@/lib/redis";

const GAS_READ_URL = process.env.GAS_CATCH_REPORT_URL;

// GET: ハードコード + GAS + Redis UGCデータをマージして返す
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spot = searchParams.get("spot");

  if (!spot || spot.length > 100) {
    return NextResponse.json({ error: "invalid spot" }, { status: 400 });
  }

  // ハードコード分
  const hardcoded = getCatchReportsBySpot(spot);

  // GAS承認済みデータを取得
  let gasReports: CatchReport[] = [];
  if (GAS_READ_URL) {
    try {
      const res = await fetch(`${GAS_READ_URL}?spot=${encodeURIComponent(spot)}`, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.reports)) {
          gasReports = data.reports.map((r: Record<string, string>) => ({
            id: r.id || `gas-${Date.now()}`,
            spotSlug: r.spotSlug || spot,
            spotName: r.spotName || "",
            fishName: r.fishName || "",
            userName: r.userName || "",
            comment: r.comment || "",
            date: r.catchDate || r.date || "",
            approved: true,
            photoUrl: r.photoUrl || undefined,
            sizeCm: r.sizeCm ? Number(r.sizeCm) : undefined,
            method: r.method || undefined,
            weather: r.weather || undefined,
          }));
        }
      }
    } catch (err) {
      console.error("[catch-reports] GAS fetch error:", err);
    }
  }

  // Redis UGCデータを取得（最新50件）
  let redisReports: CatchReport[] = [];
  try {
    const raw = await redis.lrange(`ugc_reports:${spot}`, 0, 49);
    if (Array.isArray(raw)) {
      // 通報で非表示になったレポートIDを一括チェック
      const parsed = raw.map((item) => {
        if (typeof item === "string") return JSON.parse(item);
        return item; // Upstash auto-deserialize
      }) as CatchReport[];

      if (parsed.length > 0) {
        // 通報フラグチェック（パイプラインで一括取得）
        const flagKeys = parsed.map((r) => `report_flagged:${r.id}`);
        const flags = await Promise.all(flagKeys.map((key) => redis.exists(key)));
        redisReports = parsed.filter((_, i) => !flags[i]);
      }
    }
  } catch (err) {
    console.error("[catch-reports] Redis fetch error:", err);
  }

  // マージ（重複排除: idベース）
  const idSet = new Set(hardcoded.map((r) => r.id));
  const allReports = [...hardcoded];

  for (const r of [...gasReports, ...redisReports]) {
    if (!idSet.has(r.id)) {
      idSet.add(r.id);
      allReports.push(r);
    }
  }

  allReports.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json(
    { ok: true, reports: allReports },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
