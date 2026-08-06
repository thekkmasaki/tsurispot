import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserById, unfollow } from "@/lib/user-store";
import { blockUser, unblockUser, isBlockedBy } from "@/lib/social-store";

// POST/DELETE /api/users/[tsuriId]/block — ユーザーブロック
// block時は相互フォローも解除する（Twitter同様の挙動）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tsuriId: string }> },
) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(getClientIp(request), "USER_BLOCK", 30, 600))) {
    return NextResponse.json({ error: "操作が多すぎます" }, { status: 429 });
  }

  const { tsuriId: targetId } = await params;
  if (!targetId || targetId.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }
  if (targetId === viewerId) {
    return NextResponse.json({ error: "自分自身はブロックできません" }, { status: 400 });
  }
  const target = await getUserById(targetId);
  if (!target) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  await blockUser(viewerId, targetId);
  // 相互unfollow（失敗しても続行 — ブロック自体は成立させる）
  await Promise.allSettled([unfollow(viewerId, targetId), unfollow(targetId, viewerId)]);

  return NextResponse.json({ blocked: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ tsuriId: string }> },
) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { tsuriId: targetId } = await params;
  if (!targetId || targetId.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  await unblockUser(viewerId, targetId);
  return NextResponse.json({ blocked: false });
}

// GET — 閲覧者が対象をブロックしているか
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tsuriId: string }> },
) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  const { tsuriId: targetId } = await params;
  if (!viewerId || !targetId) {
    return NextResponse.json({ blocked: false });
  }
  const blocked = await isBlockedBy(viewerId, targetId);
  return NextResponse.json({ blocked });
}
