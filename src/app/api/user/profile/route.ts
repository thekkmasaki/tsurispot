import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateNickname, deleteUser } from "@/lib/auth-redis";
import { checkNgWords } from "@/lib/moderation";

// PATCH: ニックネーム変更
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { nickname } = body as { nickname?: string };

  if (!nickname || typeof nickname !== "string") {
    return NextResponse.json({ error: "ニックネームが必要です" }, { status: 400 });
  }

  const trimmed = nickname.trim();
  if (trimmed.length < 1 || trimmed.length > 20) {
    return NextResponse.json({ error: "ニックネームは1〜20文字で入力してください" }, { status: 400 });
  }

  const modResult = checkNgWords([trimmed]);
  if (!modResult.ok) {
    return NextResponse.json({ error: modResult.reason }, { status: 400 });
  }

  const ok = await updateNickname(session.user.tsuriId, trimmed);
  if (!ok) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE: アカウント削除
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const ok = await deleteUser(session.user.tsuriId);
  if (!ok) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
