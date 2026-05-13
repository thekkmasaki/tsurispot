import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { moderateImage } from "@/lib/rekognition";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  const viewerId = session?.user?.tsuriId;
  if (!viewerId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "JPG、PNG、WebPのみアップロード可能です" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは20MB以下にしてください" }, { status: 400 });
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `covers/${viewerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToS3(filename, buffer, file.type);

    try {
      const result = await moderateImage(filename);
      if (!result.safe) {
        await deleteFromS3(url);
        console.warn("[cover-photo] モデレーションNG:", result.reason, result.labels);
        return NextResponse.json(
          { error: "この画像はアップロードできません。別の写真をお試しください。" },
          { status: 400 },
        );
      }
    } catch (err) {
      console.error("[cover-photo] Rekognitionエラー（スルー）:", err);
    }

    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("Cover photo S3 upload error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
