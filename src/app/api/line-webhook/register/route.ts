import { NextRequest, NextResponse } from "next/server";
import { dbPut } from "@/lib/dynamodb";
import { safeEqual, resolveAdminToken } from "@/lib/safe-compare";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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
  // 総当たり対策（IP単位: 10分に10回）
  if (!(await checkRateLimit(getClientIp(request), "LINEREGISTER", 10, 600))) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { adminKey, lineUserId, shopSlug, token, shopName } = body as Record<string, string | undefined>;

  // 管理キー: ADMIN_LINE_TOKEN（未設定時は従来どおり LINE_CHANNEL_SECRET にフォールバック）
  const expectedKey = resolveAdminToken("ADMIN_LINE_TOKEN", "LINE_CHANNEL_SECRET");
  if (typeof adminKey !== "string" || !expectedKey || !safeEqual(adminKey, expectedKey)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!lineUserId || !shopSlug || !token || !shopName) {
    return NextResponse.json(
      { error: "lineUserId, shopSlug, token, shopName required" },
      { status: 400 }
    );
  }

  try {
    await dbPut(`LINE#${lineUserId}`, "SHOPMAPPING", {
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
      { error: "DynamoDB保存に失敗しました" },
      { status: 500 }
    );
  }
}
