import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateProfile, deleteUser, getUserById } from "@/lib/auth-redis";
import { checkNgWords } from "@/lib/moderation";

interface ProfilePatch {
  nickname?: string;
  bio?: string;
  headerImage?: string;
  isPublic?: boolean;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const user = await getUserById(session.user.tsuriId);
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      headerImage: user.headerImage,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
      reportCount: user.reportCount,
      provider: user.provider,
      upstreamProvider: user.upstreamProvider,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ProfilePatch;
  const patch: ProfilePatch = {};

  if (body.nickname !== undefined) {
    if (typeof body.nickname !== "string") {
      return NextResponse.json({ error: "ニックネームの形式が不正です" }, { status: 400 });
    }
    const trimmed = body.nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      return NextResponse.json({ error: "ニックネームは1〜20文字で入力してください" }, { status: 400 });
    }
    const mod = checkNgWords([trimmed]);
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }
    patch.nickname = trimmed;
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== "string") {
      return NextResponse.json({ error: "自己紹介の形式が不正です" }, { status: 400 });
    }
    const trimmed = body.bio.trim();
    if (trimmed.length > 140) {
      return NextResponse.json({ error: "自己紹介は140文字以内で入力してください" }, { status: 400 });
    }
    if (trimmed.length > 0) {
      const mod = checkNgWords([trimmed]);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 400 });
      }
    }
    patch.bio = trimmed;
  }

  if (body.headerImage !== undefined) {
    if (typeof body.headerImage !== "string" || body.headerImage.length > 500) {
      return NextResponse.json({ error: "ヘッダー画像URLの形式が不正です" }, { status: 400 });
    }
    if (body.headerImage && !/^https?:\/\//.test(body.headerImage)) {
      return NextResponse.json({ error: "ヘッダー画像はhttp(s)で始まるURLを指定してください" }, { status: 400 });
    }
    patch.headerImage = body.headerImage;
  }

  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json({ error: "公開設定の形式が不正です" }, { status: 400 });
    }
    patch.isPublic = body.isPublic;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  const updated = await updateProfile(session.user.tsuriId, patch);
  if (!updated) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: updated });
}

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
