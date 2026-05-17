import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

interface CatchReport {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  comment?: string;
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

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1;
  const dd = today.getDate();
  const todayMD = `${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const todayISO = today.toISOString().slice(0, 10);

  // 1) 過去年の同じ MM-DD (年が違う = 1年以上前の同月同日)
  const onThisDay = reports.filter((r) => {
    if (!r.date) return false;
    return r.date.slice(5) === todayMD && r.date.slice(0, 4) !== String(yyyy);
  });

  // 2) 今月の過去日 (今年の今月で今日以前、ただし今日除く)
  const sameMonthThisYear = reports.filter((r) => {
    if (!r.date) return false;
    const [y, m, d] = r.date.split("-").map((x) => parseInt(x, 10));
    return y === yyyy && m === mm && d < dd;
  });

  // 3) 過去7日 (今日除く)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenAgoISO = sevenDaysAgo.toISOString().slice(0, 10);
  const past7Days = reports.filter((r) => {
    if (!r.date) return false;
    return r.date >= sevenAgoISO && r.date < todayISO;
  });

  // sort 新→古
  const byDateDesc = (a: CatchReport, b: CatchReport) =>
    (b.date ?? "").localeCompare(a.date ?? "");
  onThisDay.sort(byDateDesc);
  sameMonthThisYear.sort(byDateDesc);
  past7Days.sort(byDateDesc);

  return NextResponse.json({
    onThisDay: onThisDay.slice(0, 5),
    sameMonthThisYear: sameMonthThisYear.slice(0, 5),
    past7Days: past7Days.slice(0, 5),
  });
}
