import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getShopBySlug } from "@/lib/data/shops";

const REDIS_PREFIX = "baitstock:";

export interface BaitStockEntry {
  name: string;
  available: boolean;
  status?: "available" | "low" | "out";
  price?: string;
  updatedAt: string;
}

// Redis呼び出しに5秒タイムアウトを設定
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

// GET /api/bait-stock?shop=slug
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("shop");
  if (!slug) {
    return NextResponse.json({ error: "shop parameter required" }, { status: 400 });
  }

  const headers = { "Cache-Control": "no-cache" };

  // Redis優先、なければ静的データにフォールバック
  try {
    const data = await withTimeout(redis.get<BaitStockEntry[]>(`${REDIS_PREFIX}${slug}`));
    if (data && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ stock: data, shop: slug, live: true }, { headers });
    }
  } catch {
    // Redis失敗時は静的データにフォールバック
  }

  const shopData = getShopBySlug(slug);
  const fallback = shopData?.baitStock ?? [];
  return NextResponse.json({ stock: fallback, shop: slug, live: false }, { headers });
}

// POST /api/bait-stock
// Body: { shop: string, token: string, stock: BaitStockEntry[] }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { shop, token, stock } = body as {
    shop: string;
    token: string;
    stock: BaitStockEntry[];
  };

  if (!shop || !token || !stock) {
    return NextResponse.json({ error: "shop, token, stock required" }, { status: 400 });
  }

  // stock が配列であることを検証
  if (!Array.isArray(stock)) {
    return NextResponse.json({ error: "stock must be an array" }, { status: 400 });
  }

  // デモ店舗はトークン不要
  const isDemo = shop === "sample-premium" || shop === "sample-basic" || shop === "sample-free";
  if (!isDemo) {
    // トークン検証: Redis に保存されたトークンと照合
    try {
      const storedToken = await withTimeout(redis.get<string>(`shoptoken:${shop}`));
      if (!storedToken || storedToken !== token) {
        return NextResponse.json({ error: "invalid token" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
  }

  // ショップの存在確認
  const shopData = getShopBySlug(shop);
  if (!shopData) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  // タイムスタンプを付与
  const now = new Date();
  const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  const stockWithTime = stock.map((item) => ({
    ...item,
    updatedAt: timeStr,
  }));

  // Redisに保存（7日間TTL）+ レートリミット
  try {
    const rateLimitKey = `baitlimit:${shop}:${new Date().toISOString().slice(0, 10)}`;
    const count = await withTimeout(redis.incr(rateLimitKey));
    if (count === 1) {
      await withTimeout(redis.expire(rateLimitKey, 86400));
    }
    // レートリミット: planLevelに基づいて判定
    const planLevel = shopData.planLevel || "free";
    const dailyLimits: Record<string, number> = { free: 10, basic: 10, pro: 50 };
    const dailyLimit = isDemo ? 100 : (dailyLimits[planLevel] ?? 10);
    if (count && count > dailyLimit) {
      return NextResponse.json(
        { error: `本日の更新回数の上限に達しました（1日${dailyLimit}回まで）。プロプラン（初年度 月額1,980円）なら1日50回まで更新できます。` },
        { status: 429 }
      );
    }
    await withTimeout(redis.set(`${REDIS_PREFIX}${shop}`, stockWithTime, { ex: 604800 }));
  } catch {
    // Redis接続エラー時もデモでは成功扱い
    if (!isDemo) {
      return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, stock: stockWithTime });
}
