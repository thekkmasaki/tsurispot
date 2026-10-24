import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";
import { getEffectivePlan, verifyShopToken, isDemoShop } from "@/lib/shop-plan";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { moderateImage } from "@/lib/rekognition";

// Rekognition が扱えるのは JPEG/PNG のみ。審査できない形式（WebP等）は fail-closed のため受け付けない。
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PLAN_LIMITS: Record<string, number> = { basic: 3, pro: 20 };
const SHOP_SLUG_RE = /^[a-z0-9-]{1,100}$/;

/** magic bytes から画像形式を判定（Content-Type / ファイル名は信用しない） */
function sniffImage(buf: Buffer): { mime: "image/jpeg" | "image/png"; ext: "jpg" | "png" } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  return null;
}

async function authenticate(
  shop: unknown,
  token: unknown
): Promise<{ ok: boolean; error?: string; status?: number }> {
  if (typeof shop !== "string" || !SHOP_SLUG_RE.test(shop) || typeof token !== "string" || token.length === 0 || token.length > 200) {
    return { ok: false, error: "invalid token", status: 403 };
  }
  // デモ店舗は書き込み不可（固定トークンは受け付けない）
  if (isDemoShop(shop)) {
    return { ok: false, error: "デモ店舗では写真をアップロードできません", status: 403 };
  }
  try {
    if (!(await verifyShopToken(shop, token))) {
      return { ok: false, error: "invalid token", status: 403 };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "サーバーエラー", status: 500 };
  }
}

// GET /api/shop-photos?shop=slug
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("shop");
  if (!slug) {
    return NextResponse.json({ error: "shop parameter required" }, { status: 400 });
  }

  try {
    const photos = await dbGet<string[]>(`SHOP#${slug}`, "PHOTOS");
    return NextResponse.json(
      { photos: photos || [], shop: slug },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ photos: [], shop: slug });
  }
}

// POST /api/shop-photos — multipart/form-data upload
export async function POST(request: NextRequest) {
  // 認証総当たり・S3/Rekognition課金の濫用対策（IP単位: 10分に20回）
  if (!(await checkRateLimit(getClientIp(request), "SHOPPHOTOS", 20, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }
  const shop = formData.get("shop");
  const token = formData.get("token");
  const file = formData.get("file");

  if (typeof shop !== "string" || typeof token !== "string" || !shop || !token || !(file instanceof File)) {
    return NextResponse.json(
      { error: "shop, token, file required" },
      { status: 400 }
    );
  }

  // 認証
  const auth = await authenticate(shop, token);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // ショップ存在確認
  const shopData = getShopBySlug(shop);
  if (!shopData) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  // ファイルバリデーション（サイズ → 実バイト列による形式判定）
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは5MB以下にしてください" },
      { status: 400 }
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImage(buffer);
  if (!sniffed) {
    return NextResponse.json(
      { error: "JPG、PNGのみアップロード可能です" },
      { status: 400 }
    );
  }

  // プラン制限チェック（課金状態を加味した実効プラン）
  const planLevel = await getEffectivePlan(shop);
  const maxPhotos = PLAN_LIMITS[planLevel] || 0;
  if (maxPhotos === 0) {
    return NextResponse.json(
      { error: "写真アップロードはベーシックプラン以上で利用できます" },
      { status: 403 }
    );
  }

  let currentPhotos: string[] = [];
  try {
    currentPhotos =
      (await dbGet<string[]>(`SHOP#${shop}`, "PHOTOS")) || [];
  } catch {
    // 取得失敗のまま保存すると既存の写真リストを上書きしてしまうため中断する
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }

  if (currentPhotos.length >= maxPhotos) {
    return NextResponse.json(
      {
        error: `写真の上限（${maxPhotos}枚）に達しています。${
          planLevel === "basic" ? "プロプランにアップグレードすると最大20枚まで可能です。" : ""
        }`,
      },
      { status: 400 }
    );
  }

  // S3 にアップロード → モデレーション（失敗・判定NGはいずれも非公開=削除。fail-closed）
  const filename = `shops/${shop}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${sniffed.ext}`;

  let url: string;
  try {
    url = await uploadToS3(filename, buffer, sniffed.mime);
  } catch (e) {
    console.error("S3 upload error:", e);
    return NextResponse.json(
      { error: "アップロードに失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }

  try {
    const result = await moderateImage(filename);
    if (!result.safe) {
      await deleteFromS3(url).catch(() => {});
      console.warn("[shop-photos] モデレーションNG:", result.reason, result.labels);
      return NextResponse.json(
        { error: "この画像はアップロードできません。別の写真をお試しください。" },
        { status: 400 }
      );
    }
  } catch (err) {
    await deleteFromS3(url).catch(() => {});
    console.error("[shop-photos] Rekognitionエラー（fail-closed で却下）:", err);
    return NextResponse.json(
      { error: "画像の確認に失敗しました。しばらくしてから再度お試しください。" },
      { status: 503 }
    );
  }

  try {
    // DynamoDB に URL を追加
    const updatedPhotos = [...currentPhotos, url];
    await dbPut(`SHOP#${shop}`, "PHOTOS", updatedPhotos, 2592000);

    return NextResponse.json({
      success: true,
      url,
      photos: updatedPhotos,
    });
  } catch (e) {
    console.error("DynamoDB photos save error:", e);
    await deleteFromS3(url).catch(() => {});
    return NextResponse.json(
      { error: "アップロードに失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}

// DELETE /api/shop-photos
// Body: { shop, token, url }
export async function DELETE(request: NextRequest) {
  if (!(await checkRateLimit(getClientIp(request), "SHOPPHOTOS", 20, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { shop, token, url } = body as {
    shop?: unknown;
    token?: unknown;
    url?: unknown;
  };

  if (typeof shop !== "string" || typeof token !== "string" || typeof url !== "string" || !shop || !token || !url) {
    return NextResponse.json(
      { error: "shop, token, url required" },
      { status: 400 }
    );
  }

  const auth = await authenticate(shop, token);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // DynamoDB から現在の写真一覧を取得し、削除対象URLがこのshopに属するか確認
  try {
    const currentPhotos =
      (await dbGet<string[]>(`SHOP#${shop}`, "PHOTOS")) || [];
    if (!currentPhotos.includes(url)) {
      return NextResponse.json({ error: "指定された写真が見つかりません" }, { status: 404 });
    }

    // S3 から削除
    try {
      await deleteFromS3(url);
    } catch {
      // S3削除失敗は無視（URLが無効な場合もある）
    }

    // DynamoDB から URL を削除
    const updatedPhotos = currentPhotos.filter((p) => p !== url);
    await dbPut(`SHOP#${shop}`, "PHOTOS", updatedPhotos, 2592000);
    return NextResponse.json({ success: true, photos: updatedPhotos });
  } catch {
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
