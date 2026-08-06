import { NextRequest, NextResponse } from "next/server";
import { getPostMeta, isPostFlagged } from "@/lib/social-store";

// GET /api/posts/[id] — 釣果投稿の単体取得（公開・認証不要）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "IDが不正です" }, { status: 400 });
  }

  const [post, flagged] = await Promise.all([getPostMeta(id), isPostFlagged(id)]);
  if (!post || flagged) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
