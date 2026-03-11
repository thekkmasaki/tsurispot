import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { redis } from "@/lib/redis";
import { getShopBySlug } from "@/lib/data/shops";

const REDIS_PREFIX = "shopphotos:";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PLAN_LIMITS: Record<string, number> = { basic: 3, pro: 20 };

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

async function authenticate(
  shop: string,
  token: string
): Promise<{ ok: boolean; error?: string; status?: number }> {
  const isDemo = shop === "sample-premium" || shop === "sample-basic";
  if (isDemo && token === "demo") return { ok: true };

  try {
    const stored = await withTimeout(redis.get<string>(`shoptoken:${shop}`));
    if (!stored || stored !== token) {
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
    const photos = await withTimeout(redis.get<string[]>(`${REDIS_PREFIX}${slug}`));
    return NextResponse.json(
      { photos: photos || [], shop: slug },
      { headers: { "Cache-Control": "no-cache" } }
    );
  } catch {
    return NextResponse.json({ photos: [], shop: slug });
  }
}

// POST /api/shop-photos — multipart/form-data upload
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const shop = formData.get("shop") as string;
  const token = formData.get("token") as string;
  const file = formData.get("file") as File | null;

  if (!shop || !token || !file) {
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

  // ファイルバリデーション
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "JPG、PNG、WebPのみアップロード可能です" },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは5MB以下にしてください" },
      { status: 400 }
    );
  }

  // プラン制限チェック
  const planLevel = shopData.planLevel || "free";
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
      (await withTimeout(redis.get<string[]>(`${REDIS_PREFIX}${shop}`))) || [];
  } catch {
    // pass
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

  // Vercel Blob にアップロード
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `shops/${shop}/${Date.now()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Redis に URL を追加
    const updatedPhotos = [...currentPhotos, blob.url];
    await withTimeout(
      redis.set(`${REDIS_PREFIX}${shop}`, updatedPhotos, { ex: 2592000 })
    );

    return NextResponse.json({
      success: true,
      url: blob.url,
      photos: updatedPhotos,
    });
  } catch (e) {
    console.error("Blob upload error:", e);
    return NextResponse.json(
      { error: "アップロードに失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}

// DELETE /api/shop-photos
// Body: { shop, token, url }
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { shop, token, url } = body as {
    shop: string;
    token: string;
    url: string;
  };

  if (!shop || !token || !url) {
    return NextResponse.json(
      { error: "shop, token, url required" },
      { status: 400 }
    );
  }

  const auth = await authenticate(shop, token);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Redis から現在の写真一覧を取得し、削除対象URLがこのshopに属するか確認
  try {
    const currentPhotos =
      (await withTimeout(redis.get<string[]>(`${REDIS_PREFIX}${shop}`))) || [];
    if (!currentPhotos.includes(url)) {
      return NextResponse.json({ error: "指定された写真が見つかりません" }, { status: 404 });
    }

    // Blob から削除
    try {
      await del(url);
    } catch {
      // Blob削除失敗は無視（URLが無効な場合もある）
    }

    // Redis から URL を削除
    const updatedPhotos = currentPhotos.filter((p) => p !== url);
    await withTimeout(
      redis.set(`${REDIS_PREFIX}${shop}`, updatedPhotos, { ex: 2592000 })
    );
    return NextResponse.json({ success: true, photos: updatedPhotos });
  } catch {
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
