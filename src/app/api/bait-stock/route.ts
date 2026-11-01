import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut, dbIncr } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";
import { getEffectivePlan, verifyShopToken, isDemoShop } from "@/lib/shop-plan";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

const SHOP_SLUG_RE = /^[a-z0-9-]{1,100}$/;
const MAX_STOCK_ITEMS = 50;
const STATUS_VALUES = ["available", "low", "out"] as const;

type StockInput = Omit<BaitStockEntry, "updatedAt">;

/** stock の各要素を検証し、許可フィールドのみの新しいオブジェクトに詰め直す。不正なら null。 */
function sanitizeStock(raw: unknown): StockInput[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_STOCK_ITEMS) return null;
  const out: StockInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const { name, available, status, price } = item as Record<string, unknown>;
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 50) return null;
    if (typeof available !== "boolean") return null;
    const entry: StockInput = { name: name.trim(), available };
    if (status !== undefined) {
      if (typeof status !== "string" || !(STATUS_VALUES as readonly string[]).includes(status)) return null;
      entry.status = status as StockInput["status"];
    }
    if (price !== undefined) {
      if (typeof price !== "string" || price.length > 30) return null;
      entry.price = price;
    }
    out.push(entry);
  }
  return out;
}

function timestamp(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
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

  const { shop, token, stock } = body as { shop?: unknown; token?: unknown; stock?: unknown };

  if (typeof shop !== "string" || !SHOP_SLUG_RE.test(shop) || typeof token !== "string" || !stock) {
    return NextResponse.json({ error: "shop, token, stock required" }, { status: 400 });
  }
  if (token.length > 200) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  const cleanStock = sanitizeStock(stock);
  if (!cleanStock) {
    return NextResponse.json({ error: "stock の形式が不正です" }, { status: 400 });
  }

  // トークン総当たり対策（IP単位: 10分に30回）
  if (!(await checkRateLimit(getClientIp(request), "BAITSTOCK_AUTH", 30, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  const stockWithTime = cleanStock.map((item) => ({ ...item, updatedAt: timestamp() }));

  // デモ店舗: 体験用に成功を返すが、何も保存しない
  if (isDemoShop(shop)) {
    return NextResponse.json({ success: true, stock: stockWithTime, demo: true });
  }

  try {
    if (!(await verifyShopToken(shop, token))) {
      return NextResponse.json({ error: "invalid token" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }

  // ショップの存在確認
  if (!getShopBySlug(shop)) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  // DynamoDBに保存（7日間TTL）+ 日次レートリミット。障害時は成功扱いにしない。
  try {
    const date = new Date().toISOString().slice(0, 10);
    const count = await dbIncr(`SHOP#${shop}`, `BAITLIMIT#${date}`, 1, 86400);
    const planLevel = await getEffectivePlan(shop);
    const dailyLimits: Record<string, number> = { free: 10, basic: 10, pro: 50 };
    const dailyLimit = dailyLimits[planLevel] ?? 10;
    if (count > dailyLimit) {
      return NextResponse.json(
        { error: `本日の更新回数の上限に達しました（1日${dailyLimit}回まで）。プロプラン（初年度 月額1,980円）なら1日50回まで更新できます。` },
        { status: 429 }
      );
    }
    await dbPut(`SHOP#${shop}`, "BAITSTOCK", stockWithTime, 604800);
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
  }

  return NextResponse.json({ success: true, stock: stockWithTime });
}
