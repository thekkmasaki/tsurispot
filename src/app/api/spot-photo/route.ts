import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "crypto";
import { auth } from "@/lib/auth";
import { deleteFromS3 } from "@/lib/s3";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readMultipartFile, validateAndUploadImage } from "@/lib/image-upload";
import { rejectInactiveUser } from "@/lib/user-status";
import { indexUserSpotPhoto } from "@/lib/account-cleanup";
import { readJsonBody, resolveSpot, SPOT_SLUG_RE } from "@/lib/ugc-validation";

const MAX_PHOTOS_PER_SPOT = 20;

interface SpotPhotoEntry {
  url: string;
  token: string;
  uploadedAt: number;
  uploaderId?: string;
}

function tokenMatches(actual: string, given: unknown): boolean {
  if (typeof given !== "string" || given.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(given));
}

// GET /api/spot-photo?slug=xxx
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug || !SPOT_SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
  }

  try {
    const photos = (await dbGet<SpotPhotoEntry[]>(`SPOT#${slug}`, "PHOTOS")) || [];
    return NextResponse.json(
      { photos: photos.map((p) => ({ url: p.url, uploadedAt: p.uploadedAt })) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json({ photos: [] });
  }
}

// POST /api/spot-photo — multipart/form-data upload（ログイン必須）
export async function POST(request: NextRequest) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "写真の投稿にはログインが必要です" }, { status: 401 });
  }
  const inactive = await rejectInactiveUser(tsuriId);
  if (inactive) return inactive;

  // レート制限（S3 + Rekognition 課金の濫用防止）: ユーザー10分に10枚 / IP10分に20枚
  if (
    !(await checkRateLimit(tsuriId, "SPOT_PHOTO_USER", 10, 600)) ||
    !(await checkRateLimit(getClientIp(request), "SPOT_PHOTO", 20, 600))
  ) {
    return NextResponse.json(
      { error: "アップロード回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  const parsed = await readMultipartFile(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const spot = resolveSpot(parsed.formData.get("slug"));
  if (!spot) {
    return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
  }
  const slug = spot.slug;

  // 枚数制限チェック
  let currentPhotos: SpotPhotoEntry[] = [];
  try {
    currentPhotos = (await dbGet<SpotPhotoEntry[]>(`SPOT#${slug}`, "PHOTOS")) || [];
  } catch { /* pass */ }

  if (currentPhotos.length >= MAX_PHOTOS_PER_SPOT) {
    return NextResponse.json(
      { error: `このスポットの写真は上限（${MAX_PHOTOS_PER_SPOT}枚）に達しています` },
      { status: 400 },
    );
  }

  const result = await validateAndUploadImage(parsed.file, `spot-photos/${slug}`, "spot-photo");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    // 削除用トークン（暗号論的乱数）
    const token = randomBytes(16).toString("hex");
    const entry: SpotPhotoEntry = { url: result.url, token, uploadedAt: Date.now(), uploaderId: tsuriId };
    await dbPut(`SPOT#${slug}`, "PHOTOS", [...currentPhotos, entry]);
    await indexUserSpotPhoto(tsuriId, slug, result.url).catch((err) =>
      console.error("[spot-photo] 退会用索引の書込エラー:", err),
    );
    return NextResponse.json({ ok: true, url: result.url, token });
  } catch (e) {
    console.error("[spot-photo] 保存エラー:", e);
    await deleteFromS3(result.url).catch(() => {});
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}

// DELETE /api/spot-photo
export async function DELETE(request: NextRequest) {
  const body = await readJsonBody<{ slug?: string; url?: string; token?: string }>(request, 4 * 1024);
  if (!body) {
    return NextResponse.json({ error: "リクエスト形式が不正です" }, { status: 400 });
  }
  const { slug, url, token } = body;

  if (typeof slug !== "string" || !SPOT_SLUG_RE.test(slug) || typeof url !== "string" || !token) {
    return NextResponse.json({ error: "slug, url, token required" }, { status: 400 });
  }
  if (!(await checkRateLimit(getClientIp(request), "SPOT_PHOTO_DELETE", 30, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }

  try {
    const currentPhotos = (await dbGet<SpotPhotoEntry[]>(`SPOT#${slug}`, "PHOTOS")) || [];
    const target = currentPhotos.find((p) => p.url === url && tokenMatches(p.token, token));
    if (!target) {
      return NextResponse.json({ error: "写真が見つからないか、削除権限がありません" }, { status: 404 });
    }

    try { await deleteFromS3(url); } catch { /* S3削除失敗は無視 */ }

    const updatedPhotos = currentPhotos.filter((p) => p.url !== url);
    await dbPut(`SPOT#${slug}`, "PHOTOS", updatedPhotos);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
