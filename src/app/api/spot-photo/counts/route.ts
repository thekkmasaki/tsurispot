import { NextRequest, NextResponse } from "next/server";
import { dbBatchGet } from "@/lib/dynamodb";
import { SPOT_SLUG_RE } from "@/lib/ugc-validation";

/**
 * GET /api/spot-photo/counts?slugs=a,b,c（最大30件）
 * みんなの投稿写真の枚数をまとめて返す（写真募集一覧で「投稿あり」を出す用）。
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = [...new Set(raw.split(",").filter((s) => SPOT_SLUG_RE.test(s)))].slice(0, 30);
  if (slugs.length === 0) return NextResponse.json({ counts: {} });
  try {
    const rows = await dbBatchGet<unknown[]>(slugs.map((s) => ({ pk: `SPOT#${s}`, sk: "PHOTOS" })));
    const counts: Record<string, number> = {};
    slugs.forEach((s, i) => {
      const r = rows[i];
      counts[s] = Array.isArray(r) ? r.length : 0;
    });
    return NextResponse.json(
      { counts },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ counts: {} });
  }
}
