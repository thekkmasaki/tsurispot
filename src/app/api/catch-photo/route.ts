import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readMultipartFile, validateAndUploadImage } from "@/lib/image-upload";
import { rejectInactiveUser } from "@/lib/user-status";

export async function POST(request: NextRequest) {
  // レート制限（S3 + Rekognition 課金の濫用防止）: 1IP 10分間に 20 枚まで
  if (!(await checkRateLimit(getClientIp(request), "CATCH_PHOTO", 20, 600))) {
    return NextResponse.json(
      { error: "アップロード回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  // 匿名投稿も許可するが、ログイン済みなら退会/BANを弾き、ユーザー単位でも制限する
  const session = await auth().catch(() => null);
  const tsuriId = session?.user?.tsuriId;
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
  return NextResponse.json({ ok: true, url: result.url });
}
