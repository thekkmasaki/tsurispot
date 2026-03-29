import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { moderateImage } from "@/lib/rekognition";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

const REDIS_PREFIX = "spotphotos:";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB（クライアント側で自動圧縮済み）
const MAX_PHOTOS_PER_SPOT = 20;

interface SpotPhotoEntry {
  url: string;
  token: string;
  userId?: string;
  userName?: string;
  uploadedAt: number;
}

// GET /api/spot-photo?slug=xxx
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
  }

  // 認証ユーザーの場合、自分の写真を判定するためにuserIdを取得
  const session = await auth();
  const userId = session?.user?.tsuriId;

  try {
    const photos = (await redis.get<SpotPhotoEntry[]>(`${REDIS_PREFIX}${slug}`)) || [];
    return NextResponse.json(
      {
        photos: photos.map((p) => ({
          url: p.url,
          uploadedAt: p.uploadedAt,
          userName: p.userName || undefined,
          mine: !!(userId && p.userId === userId),
        })),
      },
      { headers: { "Cache-Control": "no-cache" } },
    );
  } catch {
    return NextResponse.json({ photos: [] });
  }
}

// POST /api/spot-photo — multipart/form-data upload
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = formData.get("slug") as string;
  const file = formData.get("file") as File | null;

  if (!slug || !file) {
    return NextResponse.json({ error: "slug, file required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "JPG、PNG、WebPのみアップロード可能です" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは20MB以下にしてください" }, { status: 400 });
  }

  // 枚数制限チェック
  let currentPhotos: SpotPhotoEntry[] = [];
  try {
    currentPhotos = (await redis.get<SpotPhotoEntry[]>(`${REDIS_PREFIX}${slug}`)) || [];
  } catch { /* pass */ }

  if (currentPhotos.length >= MAX_PHOTOS_PER_SPOT) {
    return NextResponse.json(
      { error: `このスポットの写真は上限（${MAX_PHOTOS_PER_SPOT}枚）に達しています` },
      { status: 400 },
    );
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `spot-photos/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToS3(filename, buffer, file.type);

    // Rekognitionモデレーション
    try {
      const result = await moderateImage(filename);
      if (!result.safe) {
        await deleteFromS3(url);
        console.warn("[spot-photo] モデレーションNG:", result.reason, result.labels);
        return NextResponse.json(
          { error: "この画像はアップロードできません。別の写真をお試しください。" },
          { status: 400 },
        );
      }
    } catch (err) {
      console.error("[spot-photo] Rekognitionエラー（スルー）:", err);
    }

    // 削除用トークン
    const token = Math.random().toString(36).slice(2, 14);

    // 認証ユーザーの場合はuserIdを付与
    const session = await auth();
    const userId = session?.user?.tsuriId || undefined;

    const userName = session?.user?.nickname || undefined;
    const entry: SpotPhotoEntry = { url, token, userId, userName, uploadedAt: Date.now() };
    const updatedPhotos = [...currentPhotos, entry];
    await redis.set(`${REDIS_PREFIX}${slug}`, updatedPhotos);

    // 認証ユーザーの場合、ユーザー別写真リストにも追加
    if (userId) {
      const userPhotosKey = `auth:user_photos:${userId}`;
      const userPhotos = (await redis.get<{ spotSlug: string; url: string }[]>(userPhotosKey)) || [];
      userPhotos.push({ spotSlug: slug, url });
      await redis.set(userPhotosKey, userPhotos);
    }

    return NextResponse.json({ ok: true, url, token });
  } catch (e) {
    console.error("S3 upload error:", e);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}

// DELETE /api/spot-photo
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { slug, url, token } = body as { slug: string; url: string; token?: string };

  if (!slug || !url) {
    return NextResponse.json({ error: "slug, url required" }, { status: 400 });
  }

  // 認証ユーザーの場合はuserId一致でも削除可能
  const session = await auth();
  const userId = session?.user?.tsuriId;

  try {
    const currentPhotos = (await redis.get<SpotPhotoEntry[]>(`${REDIS_PREFIX}${slug}`)) || [];
    const target = currentPhotos.find(
      (p) => p.url === url && (p.token === token || (userId && p.userId === userId)),
    );
    if (!target) {
      return NextResponse.json({ error: "写真が見つからないか、削除権限がありません" }, { status: 404 });
    }

    try { await deleteFromS3(url); } catch { /* S3削除失敗は無視 */ }

    const updatedPhotos = currentPhotos.filter((p) => p.url !== url);
    await redis.set(`${REDIS_PREFIX}${slug}`, updatedPhotos);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
