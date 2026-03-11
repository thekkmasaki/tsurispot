import { NextResponse } from "next/server";
import { getCatchReportsBySpot, type CatchReport } from "@/lib/data/catch-reports";

const GAS_READ_URL = process.env.GAS_CATCH_REPORT_URL;

// GET: ハードコード + GAS承認済みデータをマージして返す
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
          }));
        }
      }
    } catch (err) {
      console.error("[catch-reports] GAS fetch error:", err);
    }
  }

  // マージ（重複排除: idベース）
  const idSet = new Set(hardcoded.map((r) => r.id));
  const merged = [
    ...hardcoded,
    ...gasReports.filter((r) => !idSet.has(r.id)),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json(
    { ok: true, reports: merged },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
