import { NextRequest, NextResponse } from "next/server";
import { getPostMeta, isPostFlagged } from "@/lib/social-store";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user-store";
import { maskPrivateAuthors } from "@/lib/private-author";

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

  // プロフィール非公開の人の投稿は名前とプロフィール導線を伏せる（本人を除く）
  const session = await auth();
  const [masked] = await maskPrivateAuthors([post], getUserById, session?.user?.tsuriId);
  return NextResponse.json({ post: masked });
}
