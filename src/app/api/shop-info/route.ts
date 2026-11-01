import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut, dbIncr } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";
import { verifyShopToken, isDemoShop } from "@/lib/shop-plan";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeHttpUrl } from "@/lib/safe-url";

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

const SHOP_SLUG_RE = /^[a-z0-9-]{1,100}$/;

function optionalText(raw: unknown, max: number): string | undefined | null {
  if (raw === undefined || raw === null || raw === "") return undefined;
  if (typeof raw !== "string" || raw.length > max) return null;
  return raw.trim();
}

/** info を検証し許可フィールドのみ詰め直す。不正なら null。 */
function sanitizeInfo(raw: unknown): Omit<ShopInfoOverride, "updatedAt"> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const out: Omit<ShopInfoOverride, "updatedAt"> = {};

  const businessHours = optionalText(r.businessHours, 100);
  const closedDays = optionalText(r.closedDays, 100);
  const phone = optionalText(r.phone, 30);
  const ownerMessage = optionalText(r.ownerMessage, 500);
  if (businessHours === null || closedDays === null || phone === null || ownerMessage === null) return null;
  if (businessHours) out.businessHours = businessHours;
  if (closedDays) out.closedDays = closedDays;
  if (phone) out.phone = phone;
  if (ownerMessage) out.ownerMessage = ownerMessage;

  if (r.website !== undefined && r.website !== null && r.website !== "") {
    const website = sanitizeHttpUrl(r.website);
    if (!website) return null;
    out.website = website;
  }

  if (r.services !== undefined && r.services !== null) {
    if (!Array.isArray(r.services) || r.services.length > 20) return null;
    const services: string[] = [];
    for (const sv of r.services) {
      if (typeof sv !== "string" || sv.length > 50) return null;
      if (sv.trim()) services.push(sv.trim());
    }
    out.services = services;
  }
  return out;
}

function timestamp(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// POST /api/shop-info
// Body: { shop: string, token: string, info: ShopInfoOverride }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { shop, token, info } = body as { shop?: unknown; token?: unknown; info?: unknown };

  if (typeof shop !== "string" || !SHOP_SLUG_RE.test(shop) || typeof token !== "string" || !info) {
    return NextResponse.json({ error: "shop, token, info required" }, { status: 400 });
  }
  if (token.length > 200) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  const cleanInfo = sanitizeInfo(info);
  if (!cleanInfo) {
    return NextResponse.json({ error: "info の形式が不正です（URLは http(s) のみ）" }, { status: 400 });
  }

  // トークン総当たり対策（IP単位: 10分に30回）
  if (!(await checkRateLimit(getClientIp(request), "SHOPINFO_AUTH", 30, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてからお試しください。" }, { status: 429 });
  }

  const infoWithTime: ShopInfoOverride = { ...cleanInfo, updatedAt: timestamp() };

  // デモ店舗: 体験用に成功を返すが、何も保存しない
  if (isDemoShop(shop)) {
    return NextResponse.json({ success: true, info: infoWithTime, demo: true });
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

  // レート制限: 1店舗あたり1日30回まで（障害時は成功扱いにしない）
  try {
    const date = new Date().toISOString().slice(0, 10);
    const count = await dbIncr(`SHOP#${shop}`, `INFOLIMIT#${date}`, 1, 86400);
    if (count > 30) {
      return NextResponse.json(
        { error: "本日の更新回数の上限に達しました。明日以降にお試しください。" },
        { status: 429 }
      );
    }
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
  }

  // DynamoDBに保存（30日TTL）
  try {
    await dbPut(`SHOP#${shop}`, "INFO", infoWithTime, 2592000);
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" }, { status: 500 });
  }

  return NextResponse.json({ success: true, info: infoWithTime });
}
