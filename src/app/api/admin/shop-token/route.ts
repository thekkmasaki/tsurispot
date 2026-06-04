import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";

export const runtime = "nodejs";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

/** 32文字のランダム英数字トークンを生成 */
function randomToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

/**
 * 店舗オーナー用トークンを発行する管理API（オンボーディング）。
 * Authorization: Bearer <ADMIN_SECRET> で保護。
 * Body: { shop, regenerate? }
 * - 既存トークンがあれば返す（regenerate=true で再生成）
 * - 発行したトークンは DynamoDB の SHOP#{slug}/TOKEN に保存し、管理URLを返す
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { shop?: string; regenerate?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { shop, regenerate } = body;
  if (!shop) {
    return NextResponse.json({ error: "shop required" }, { status: 400 });
  }
  if (!getShopBySlug(shop)) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  try {
    const existing = await dbGet<string>(`SHOP#${shop}`, "TOKEN");
    if (existing && !regenerate) {
      return NextResponse.json({
        shop,
        token: existing,
        dashboardUrl: `https://tsurispot.com/shops/${shop}/dashboard?token=${existing}`,
        created: false,
      });
    }
    const token = randomToken();
    await dbPut(`SHOP#${shop}`, "TOKEN", token);
    return NextResponse.json({
      shop,
      token,
      dashboardUrl: `https://tsurispot.com/shops/${shop}/dashboard?token=${token}`,
      created: true,
    });
  } catch (err) {
    console.error("[admin/shop-token] エラー:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
