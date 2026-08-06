import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserById } from "@/lib/user-store";
import { repostPost, unrepostPost, getPostMeta } from "@/lib/social-store";
import { notify } from "@/lib/notifications";

// POST/DELETE /api/reports/[id]/repost — 釣果のリポスト（冪等）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(getClientIp(request), "REPORT_REPOST", 30, 600))) {
    return NextResponse.json({ error: "操作が多すぎます" }, { status: 429 });
  }

  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }
  const post = await getPostMeta(id);
  if (!post) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }
  if (post.tsuriId === tsuriId) {
    return NextResponse.json({ error: "自分の釣果はリポストできません" }, { status: 400 });
  }

  const { count, created } = await repostPost(id, tsuriId);

  if (created && post.tsuriId) {
    const actor = await getUserById(tsuriId);
    if (actor) {
      void notify(post.tsuriId, {
        type: "repost",
        actorId: tsuriId,
        actorNickname: actor.nickname,
        reportId: id,
        excerpt: post.fishName,
      });
    }
  }

  return NextResponse.json({ reposted: true, count });
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
  if (!(await checkRateLimit(getClientIp(request), "REPORT_REPOST", 30, 600))) {
    return NextResponse.json({ error: "操作が多すぎます" }, { status: 429 });
  }

  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  const count = await unrepostPost(id, tsuriId);
  return NextResponse.json({ reposted: false, count });
}
