import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { searchUsers } from "@/lib/social-store";

// GET /api/users/search?q= — ニックネーム前方一致検索（公開・非公開プロフィールは索引外）
export async function GET(request: NextRequest) {
  if (!(await checkRateLimit(getClientIp(request), "USER_SEARCH", 30, 600))) {
    return NextResponse.json({ error: "検索が多すぎます" }, { status: 429 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!q || q.length > 30) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchUsers(q, 20);
  return NextResponse.json({ users });
}
