import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 });
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `catch-reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToS3(filename, buffer, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("S3 upload error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
