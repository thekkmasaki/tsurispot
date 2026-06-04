import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut, dbIncr } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";
import { getEffectivePlan } from "@/lib/shop-plan";

export interface BaitStockEntry {
  name: string;
  available: boolean;
  status?: "available" | "low" | "out";
  price?: string;
  updatedAt: string;
}

// GET /api/bait-stock?shop=slug
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("shop");
  if (!slug) {
    return NextResponse.json({ error: "shop parameter required" }, { status: 400 });
  }

  const headers = { "Cache-Control": "no-cache" };

  // DynamoDB優先、なければ静的データにフォールバック
  try {
    const data = await dbGet<BaitStockEntry[]>(`SHOP#${slug}`, "BAITSTOCK");
    if (data && Array.isArray(data) && data.length > 0) {
      return NextResponse.json({ stock: data, shop: slug, live: true }, { headers });
    }
  } catch {
    // DynamoDB失敗時は静的データにフォールバック
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

  // 静的トークン（掲載店舗向け）
  const STATIC_TOKENS: Record<string, string> = {
    "barbless-karatsu": "barbless-2026",
  };
  const staticMatch = !!(STATIC_TOKENS[shop] && STATIC_TOKENS[shop] === token);
  // DynamoDB障害時にも保存成功扱いにする対象
  const isVerified = isDemo || staticMatch;

  if (!isDemo) {

    if (!staticMatch) {
      // DynamoDB に保存されたトークンと照合
      try {
        const storedToken = await dbGet<string>(`SHOP#${shop}`, "TOKEN");
        if (!storedToken || storedToken !== token) {
          return NextResponse.json({ error: "invalid token" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
      }
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

  // DynamoDBに保存（7日間TTL）+ レートリミット
  try {
    const date = new Date().toISOString().slice(0, 10);
    const count = await dbIncr(`SHOP#${shop}`, `BAITLIMIT#${date}`, 1, 86400);
    // レートリミット: 課金状態を加味した実効プランに基づいて判定
    const planLevel = await getEffectivePlan(shop);
    const dailyLimits: Record<string, number> = { free: 10, basic: 10, pro: 50 };
    const dailyLimit = isVerified ? 100 : (dailyLimits[planLevel] ?? 10);
    if (count > dailyLimit) {
      return NextResponse.json(
        { error: `本日の更新回数の上限に達しました（1日${dailyLimit}回まで）。プロプラン（初年度 月額1,980円）なら1日50回まで更新できます。` },
        { status: 429 }
      );
    }
    await dbPut(`SHOP#${shop}`, "BAITSTOCK", stockWithTime, 604800);
  } catch {
    // DynamoDB接続エラー時は認証済み店舗なら成功扱い
    if (!isVerified) {
      return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, stock: stockWithTime });
}
