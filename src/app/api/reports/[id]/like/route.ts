import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserById } from "@/lib/user-store";
import { likePost, unlikePost, getPostMeta } from "@/lib/social-store";
import { notify } from "@/lib/notifications";

// POST/DELETE /api/reports/[id]/like — 釣果へのいいね（冪等）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(getClientIp(request), "REPORT_LIKE", 60, 600))) {
    return NextResponse.json({ error: "操作が多すぎます" }, { status: 429 });
  }

  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }
  // 実在しない投稿IDへのいいね（ゴミitem蓄積）を防ぐ
  const post = await getPostMeta(id);
  if (!post) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }

  const { count, created } = await likePost(id, tsuriId);

  // 初回いいねのみ通知（unlike→re-likeの再通知はrate limitで抑制）
  if (created && post.tsuriId && post.tsuriId !== tsuriId) {
    const actor = await getUserById(tsuriId);
    if (actor) {
      void notify(post.tsuriId, {
        type: "like",
        actorId: tsuriId,
        actorNickname: actor.nickname,
        reportId: id,
        excerpt: post.fishName,
      });
    }
  }

  return NextResponse.json({ liked: true, count });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(getClientIp(request), "REPORT_LIKE", 60, 600))) {
    return NextResponse.json({ error: "操作が多すぎます" }, { status: 429 });
  }

  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  const count = await unlikePost(id, tsuriId);
  return NextResponse.json({ liked: false, count });
}
