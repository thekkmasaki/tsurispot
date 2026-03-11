import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * 管理者用: LINE userId と店舗を紐付け
 *
 * POST /api/line-webhook/register
 * Body: { adminKey, lineUserId, shopSlug, token, shopName }
 *
 * 使い方:
 * curl -X POST https://tsurispot.com/api/line-webhook/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"adminKey":"...","lineUserId":"Uxxxx","shopSlug":"fishing-nakajima","token":"xxx","shopName":"フィッシングナカジマ"}'
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { adminKey, lineUserId, shopSlug, token, shopName } = body;

  // 簡易認証（LINE_CHANNEL_SECRETを管理キーとして流用）
  const expectedKey = process.env.LINE_CHANNEL_SECRET;
  if (!adminKey || adminKey !== expectedKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!lineUserId || !shopSlug || !token || !shopName) {
    return NextResponse.json(
      { error: "lineUserId, shopSlug, token, shopName required" },
      { status: 400 }
    );
  }

  try {
    await redis.set(`line:${lineUserId}`, {
      shopSlug,
      token,
      shopName,
    });

    return NextResponse.json({
      success: true,
      message: `${shopName} (${shopSlug}) を LINE userId ${lineUserId} に紐付けました`,
    });
  } catch {
    return NextResponse.json(
      { error: "Redis保存に失敗しました" },
      { status: 500 }
    );
  }
}
