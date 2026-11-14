import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/app-link/request-user";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readMultipartFile, validateAndUploadImage } from "@/lib/image-upload";
import { rejectInactiveUser } from "@/lib/user-status";
import { deleteFromS3 } from "@/lib/s3";
import { recordUploadOwner, uploaderIdFor } from "@/lib/upload-owner";

export async function POST(request: NextRequest) {
  // レート制限（S3 + Rekognition 課金の濫用防止）: 1IP 10分間に 20 枚まで
  if (!(await checkRateLimit(getClientIp(request), "CATCH_PHOTO", 20, 600))) {
    return NextResponse.json(
      { error: "アップロード回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  // 匿名投稿も許可するが、ログイン済みなら退会/BANを弾き、ユーザー単位でも制限する
  const ru = await getRequestUser(request, { tolerateAuthError: true });
  if (ru.kind === "unauthorized") return unauthorizedResponse();
  const tsuriId = ru.kind === "user" ? ru.user.tsuriId : undefined;
  if (tsuriId) {
    const inactive = await rejectInactiveUser(tsuriId);
    if (inactive) return inactive;
    if (!(await checkRateLimit(tsuriId, "CATCH_PHOTO_USER", 30, 600))) {
      return NextResponse.json(
        { error: "アップロード回数の上限に達しました。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }
  }

  const parsed = await readMultipartFile(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const result = await validateAndUploadImage(parsed.file, "catch-reports", "catch-photo");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  // 誰がアップしたかを24時間控える（投稿時に他人の写真・放置写真の流用を防ぐ）。
  // 控えられなかった写真は投稿に使えないので、ここで消して失敗を返す
  try {
    await recordUploadOwner(result.key, uploaderIdFor(tsuriId, getClientIp(request)));
  } catch (err) {
    console.error("[catch-photo] アップロード者の記録エラー:", err);
    await deleteFromS3(result.url).catch(() => {});
    return NextResponse.json(
      { error: "アップロードに失敗しました。しばらくしてから再度お試しください。" },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, url: result.url });
}
