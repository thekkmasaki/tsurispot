import { NextRequest, NextResponse } from "next/server";
import { dbGet } from "@/lib/dynamodb";
import { getShopSubscription } from "@/lib/shop-plan";

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");
  const token = request.nextUrl.searchParams.get("token");

  if (!shop || !token) {
    return NextResponse.json({ error: "shop and token required" }, { status: 400 });
  }

  // トークン認証
  const storedToken = await dbGet<string>(`SHOP#${shop}`, "TOKEN");
  if (!storedToken || storedToken !== token) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 403 });
  }

  const subscription = await getShopSubscription(shop);
  return NextResponse.json({ subscription }, { headers: { "Cache-Control": "no-cache" } });
}
