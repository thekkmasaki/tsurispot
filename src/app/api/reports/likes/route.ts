import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLikesBulk } from "@/lib/social-store";

// GET /api/reports/likes?ids=a,b,c — いいね数と閲覧者のいいね済みIDを一括取得（一覧表示用・認証不要）
export async function GET(request: NextRequest) {
  const idsParam = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 100)
    .slice(0, 100);
  if (ids.length === 0) {
    return NextResponse.json({ counts: {}, likedIds: [] });
  }

  const session = await auth();
  const { counts, likedIds } = await getLikesBulk(ids, session?.user?.tsuriId);
  return NextResponse.json({ counts, likedIds });
}
