import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateProfile, deleteUser, getUserById, STYLE_TAGS } from "@/lib/user-store";
import { checkNgWords } from "@/lib/moderation";
import { updateUserSearchIndex, getPostMeta } from "@/lib/social-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { isReservedName, RESERVED_NAME_ERROR } from "@/lib/reserved-names";
import { isOwnImageUrl, readJsonBody } from "@/lib/ugc-validation";
import {
  clearUserStatus,
  getUserStatus,
  markUserDeleted,
  rejectInactiveUser,
  setUserBanned,
} from "@/lib/user-status";
import { cleanupUserContent } from "@/lib/account-cleanup";

/** bestCatchId は自分の投稿のみ指定可（他人の投稿を自分のベストとして表示させない） */
async function isOwnPost(tsuriId: string, reportId: string): Promise<boolean> {
  const meta = await getPostMeta(reportId);
  if (meta) return meta.tsuriId === tsuriId;
  // 正本の無い旧投稿はマイページ用リストで確認
  const raw = await redis.lrange(`auth:user_reports:${tsuriId}`, 0, 999);
  return (raw ?? []).some((item) => {
    try {
      const r = typeof item === "string" ? JSON.parse(item) : item;
      return r?.id === reportId;
    } catch {
      return false;
    }
  });
}

interface ProfilePatch {
  nickname?: string;
  bio?: string;
  headerImage?: string;
  isPublic?: boolean;
  bestCatchId?: string;
  styles?: string[];
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
      bestCatchId: user.bestCatchId,
      styles: user.styles,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const tsuriId = session.user.tsuriId;
  const inactive = await rejectInactiveUser(tsuriId);
  if (inactive) return inactive;
  if (!(await checkRateLimit(tsuriId, "PROFILE_PATCH", 30, 600))) {
    return NextResponse.json({ error: "更新が多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  const body = (await readJsonBody<ProfilePatch>(request, 8 * 1024)) ?? null;
  if (!body) {
    return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }
  const patch: ProfilePatch = {};

  if (body.nickname !== undefined) {
    if (typeof body.nickname !== "string") {
      return NextResponse.json({ error: "ニックネームの形式が不正です" }, { status: 400 });
    }
    const trimmed = body.nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      return NextResponse.json({ error: "ニックネームは1〜20文字で入力してください" }, { status: 400 });
    }
    if (isReservedName(trimmed)) {
      return NextResponse.json({ error: RESERVED_NAME_ERROR }, { status: 400 });
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
    // 空文字（解除）以外は、自分が cover-photo でアップロードした自社S3画像のみ許可
    if (body.headerImage && !isOwnImageUrl(body.headerImage, `covers/${tsuriId}/`)) {
      return NextResponse.json({ error: "ヘッダー画像は本サービスでアップロードした画像のみ指定できます" }, { status: 400 });
    }
    patch.headerImage = body.headerImage;
  }

  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json({ error: "公開設定の形式が不正です" }, { status: 400 });
    }
    patch.isPublic = body.isPublic;
  }

  if (body.bestCatchId !== undefined) {
    if (typeof body.bestCatchId !== "string" || body.bestCatchId.length > 200) {
      return NextResponse.json({ error: "Best Catch IDの形式が不正です" }, { status: 400 });
    }
    if (body.bestCatchId && !(await isOwnPost(tsuriId, body.bestCatchId))) {
      return NextResponse.json({ error: "自分の投稿のみBest Catchに指定できます" }, { status: 400 });
    }
    patch.bestCatchId = body.bestCatchId;
  }

  if (body.styles !== undefined) {
    if (!Array.isArray(body.styles)) {
      return NextResponse.json({ error: "スタイルタグの形式が不正です" }, { status: 400 });
    }
    if (body.styles.length > 5) {
      return NextResponse.json({ error: "スタイルタグは最大5個まで選べます" }, { status: 400 });
    }
    const validTags = new Set<string>(STYLE_TAGS);
    const filtered = body.styles.filter(
      (s): s is string => typeof s === "string" && validTags.has(s),
    );
    patch.styles = Array.from(new Set(filtered));
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  const updated = await updateProfile(session.user.tsuriId, patch);
  if (!updated) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  // ユーザー検索索引の更新（失敗しても本操作は成功扱い）
  updateUserSearchIndex({
    tsuriId: updated.id,
    nickname: updated.nickname,
    avatarUrl: updated.avatarUrl,
    reportCount: updated.reportCount,
    isPublic: updated.isPublic,
  }).catch((err) => console.error("[プロフィール] 検索索引更新エラー:", err));

  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE() {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(tsuriId, "PROFILE_DELETE", 5, 3600))) {
    return NextResponse.json({ error: "操作が多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  const user = await getUserById(tsuriId);
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  // 先に退会済みマークを付け、JWTセッションが残っていても書き込みAPIが拒否するようにする。
  // 失敗した場合は元の状態（BAN中ならBAN）に戻す。
  const prevStatus = await getUserStatus(tsuriId);
  await markUserDeleted(tsuriId);

  // 投稿・コメント・いいね・通知・検索索引・S3画像などを連鎖削除（deleteUser が投稿リストを消す前に実行）
  await cleanupUserContent(tsuriId, { headerImage: user.headerImage, avatarUrl: user.avatarUrl });

  const ok = await deleteUser(tsuriId);
  if (!ok) {
    if (prevStatus === "banned") await setUserBanned(tsuriId).catch(() => {});
    else await clearUserStatus(tsuriId).catch(() => {});
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
