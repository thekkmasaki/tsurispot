import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFavorites, setUserFavorites } from "@/lib/auth-redis";

// GET: 認証ユーザーのお気に入り一覧
export async function GET() {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const favorites = await getUserFavorites(session.user.tsuriId);
  return NextResponse.json({ favorites });
}

// PUT: お気に入りリスト全体を同期
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { favorites } = body as { favorites?: string[] };

  if (!Array.isArray(favorites)) {
    return NextResponse.json({ error: "favorites配列が必要です" }, { status: 400 });
  }

  // 最大100件
  const trimmed = favorites.filter((s) => typeof s === "string").slice(0, 100);
  await setUserFavorites(session.user.tsuriId, trimmed);

  return NextResponse.json({ ok: true, count: trimmed.length });
}
