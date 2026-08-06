import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLikesBulk, getCommentCountsBulk } from "@/lib/social-store";

// GET /api/reports/likes?ids=a,b,c — いいね数・閲覧者のいいね済みID・コメント数を一括取得（一覧表示用・認証不要）
export async function GET(request: NextRequest) {
  const idsParam = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 100)
    .slice(0, 100);
  if (ids.length === 0) {
    return NextResponse.json({ counts: {}, likedIds: [], commentCounts: {} });
  }

  const session = await auth();
  const [{ counts, likedIds }, commentCounts] = await Promise.all([
    getLikesBulk(ids, session?.user?.tsuriId),
    getCommentCountsBulk(ids),
  ]);
  return NextResponse.json({ counts, likedIds, commentCounts });
}
