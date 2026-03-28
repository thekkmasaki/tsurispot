import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { moderateImage } from "@/lib/rekognition";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB（クライアント側で自動圧縮済み、iPhone対応）

export async function POST(request: NextRequest) {
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
    const filename = `catch-reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToS3(filename, buffer, file.type);

    // Rekognitionモデレーションチェック
    try {
      const result = await moderateImage(filename);
      if (!result.safe) {
        // NG画像を削除
        await deleteFromS3(url);
        console.warn("[catch-photo] モデレーションNG:", result.reason, result.labels);
        return NextResponse.json(
          { error: "この画像はアップロードできません。別の写真をお試しください。" },
          { status: 400 },
        );
      }
    } catch (err) {
      // Rekognition障害時はスルー（可用性優先）
      console.error("[catch-photo] Rekognitionエラー（スルー）:", err);
    }

    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("S3 upload error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
