import { NextRequest, NextResponse } from "next/server";
import { verifyShopToken, getEffectivePlan } from "@/lib/shop-plan";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createShopSession,
  deleteShopSession,
  setShopSessionCookie,
  clearShopSessionCookie,
} from "@/lib/shop-session";

export const runtime = "nodejs";

const SHOP_SLUG_RE = /^[a-z0-9-]{1,100}$/;

/**
 * 管理URLのトークンを HttpOnly Cookie（shop_session）に交換する。
 * POST { shop, token } → 検証OKなら Cookie を発行（値は生トークンではなくランダムなセッションID）。
 * クライアントは呼び出し直後に history.replaceState で URL から ?token= を消す。
 */
export async function POST(request: NextRequest) {
  let body: { shop?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const { shop, token } = body;
  if (typeof shop !== "string" || !SHOP_SLUG_RE.test(shop) || typeof token !== "string" || !token || token.length > 200) {
    return NextResponse.json({ ok: false, error: "shop, token required" }, { status: 400 });
  }

  // トークン総当たり対策（IP単位: 10分に30回・shop-info と同じ枠）
  if (!(await checkRateLimit(getClientIp(request), "SHOPINFO_AUTH", 30, 600))) {
    return NextResponse.json({ ok: false, error: "too many requests" }, { status: 429 });
  }

  try {
    if (!(await verifyShopToken(shop, token))) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    const id = await createShopSession(shop, token);
    const plan = await getEffectivePlan(shop);
    const res = NextResponse.json({ ok: true, plan }, { headers: { "Cache-Control": "no-store" } });
    setShopSessionCookie(res, id);
    return res;
  } catch (err) {
    console.error("[shop-auth/session] エラー:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

/** ログアウト: セッションを破棄して Cookie を消す */
export async function DELETE(request: NextRequest) {
  try {
    await deleteShopSession(request);
  } catch (err) {
    console.error("[shop-auth/session] 削除エラー:", err);
  }
  const res = NextResponse.json({ ok: true });
  clearShopSessionCookie(res);
  return res;
}
