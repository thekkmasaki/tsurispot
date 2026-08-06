import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkNgWords } from "@/lib/moderation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserById } from "@/lib/user-store";
import { addComment, getComments, getPostMeta } from "@/lib/social-store";
import { notify } from "@/lib/notifications";

// GET /api/reports/[id]/comments — コメント一覧（公開・通報FLAGGED除外済み）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }
  const comments = await getComments(id);
  return NextResponse.json({ comments });
}

// POST /api/reports/[id]/comments — コメント投稿（認証必須・100字・NGワード検査）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(getClientIp(request), "REPORT_COMMENT", 10, 600))) {
    return NextResponse.json(
      { error: "コメントが多すぎます。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { text?: string };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 100) {
    return NextResponse.json({ error: "コメントは1〜100文字で入力してください" }, { status: 400 });
  }
  const mod = checkNgWords([text]);
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 400 });
  }

  const post = await getPostMeta(id);
  if (!post) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }

  // ニックネームはセッションでなく正本（user-store）から取得（改名を即反映）
  const user = await getUserById(tsuriId);
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 401 });
  }

  const comment = await addComment(id, tsuriId, user.nickname, text);

  if (post.tsuriId && post.tsuriId !== tsuriId) {
    void notify(post.tsuriId, {
      type: "comment",
      actorId: tsuriId,
      actorNickname: user.nickname,
      reportId: id,
      excerpt: text.slice(0, 40),
    });
  }

  return NextResponse.json({ ok: true, comment });
}
