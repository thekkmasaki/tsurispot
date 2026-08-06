import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment } from "@/lib/social-store";

// DELETE /api/reports/[id]/comments/[commentId] — コメント主 or 投稿主のみ削除可
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id, commentId } = await params;
  if (!id || id.length > 100 || !commentId || commentId.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  const result = await deleteComment(id, commentId, tsuriId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
