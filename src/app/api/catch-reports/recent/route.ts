import { NextResponse } from "next/server";
import { catchReports, type CatchReport } from "@/lib/data/catch-reports";
import { redis } from "@/lib/redis";
import { dbBatchGet } from "@/lib/dynamodb";

// 全スポット横断の最新釣果フィード用キー（/api/catch-report-ugc の POST が push）
const GLOBAL_RECENT_KEY = "recent_reports:global";

// GET: 全スポット横断の最新ユーザー釣果を返す（トップ「みんなの最近の釣果」用）
// Redis のグローバルリストを正とし、件数不足時はハードコードのサンプルで補完する。
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 20
      ? Math.floor(limitParam)
      : 5;

  // 実投稿（Redis グローバルリスト = 投稿が新しい順）
  let liveReports: CatchReport[] = [];
  try {
    // 通報フラグ除外で目減りする分を見込んで多めに取得
    const raw = await redis.lrange<string>(GLOBAL_RECENT_KEY, 0, limit * 4 - 1);
    const parsed: CatchReport[] = [];
    for (const item of raw) {
      try {
        const r = typeof item === "string" ? JSON.parse(item) : item;
        // 自動公開方針下ではこの判定が唯一の公開ゲート。fail-closed で approved===true のみ通す
        if (r && r.id && r.approved === true) parsed.push(r as CatchReport);
      } catch {
        // 壊れたエントリはスキップ
      }
    }
    if (parsed.length > 0) {
      const flagKeys = parsed.map((r) => ({ pk: `REPORT#${r.id}`, sk: "FLAGGED" }));
      const flags = await dbBatchGet(flagKeys);
      liveReports = parsed.filter((_, i) => flags[i] === null);
    }
  } catch (err) {
    console.error("[recent-reports] Redis fetch error:", err);
  }

  // 実投稿を優先、不足分はハードコードのサンプルで補完（id 重複排除）
  const seen = new Set<string>();
  const merged: CatchReport[] = [];
  for (const r of liveReports) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(r);
  }
  if (merged.length < limit) {
    const fallback = catchReports
      .filter((r) => r.approved)
      .sort((a, b) => b.date.localeCompare(a.date));
    for (const r of fallback) {
      if (merged.length >= limit) break;
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      merged.push(r);
    }
  }

  return NextResponse.json(
    { ok: true, reports: merged.slice(0, limit) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
