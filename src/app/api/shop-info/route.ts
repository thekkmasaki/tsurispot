import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut, dbIncr } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";

export interface ShopInfoOverride {
  businessHours?: string;
  closedDays?: string;
  phone?: string;
  website?: string;
  ownerMessage?: string;
  services?: string[];
  updatedAt: string;
}

// GET /api/shop-info?shop=slug
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("shop");
  if (!slug) {
    return NextResponse.json({ error: "shop parameter required" }, { status: 400 });
  }

  const headers = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

  try {
    const data = await dbGet<ShopInfoOverride>(`SHOP#${slug}`, "INFO");
    if (data) {
      return NextResponse.json({ info: data, shop: slug, live: true }, { headers });
    }
  } catch {
    // DynamoDB失敗時は空を返す
  }

  return NextResponse.json({ info: null, shop: slug, live: false }, { headers });
}

// POST /api/shop-info
// Body: { shop: string, token: string, info: ShopInfoOverride }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { shop, token, info } = body as {
    shop: string;
    token: string;
    info: ShopInfoOverride;
  };

  if (!shop || !token || !info) {
    return NextResponse.json({ error: "shop, token, info required" }, { status: 400 });
  }

  // デモ店舗はトークン不要
  const isDemo = shop === "sample-premium" || shop === "sample-basic" || shop === "sample-free";
  if (!isDemo) {
    try {
      const storedToken = await dbGet<string>(`SHOP#${shop}`, "TOKEN");
      if (!storedToken || storedToken !== token) {
        return NextResponse.json({ error: "invalid token" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
  }

  // ショップの存在確認
  if (!getShopBySlug(shop)) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  // レート制限: 1店舗あたり1日30回まで（デモは100回）
  try {
    const date = new Date().toISOString().slice(0, 10);
    const count = await dbIncr(`SHOP#${shop}`, `INFOLIMIT#${date}`, 1, 86400);
    const dailyLimit = isDemo ? 100 : 30;
    if (count > dailyLimit) {
      return NextResponse.json(
        { error: "本日の更新回数の上限に達しました。明日以降にお試しください。" },
        { status: 429 }
      );
    }
  } catch {
    // レート制限チェック失敗時は通す
  }

  // タイムスタンプを付与
  const now = new Date();
  const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  const infoWithTime: ShopInfoOverride = {
    ...info,
    updatedAt: timeStr,
  };

  // DynamoDBに保存（30日TTL）
  try {
    await dbPut(`SHOP#${shop}`, "INFO", infoWithTime, 2592000);
  } catch {
    if (!isDemo) {
      return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, info: infoWithTime });
}
