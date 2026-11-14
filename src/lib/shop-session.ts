import { createHash, randomBytes } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut, dbDelete } from "@/lib/dynamodb";
import { safeEqual } from "@/lib/safe-compare";
import { verifyShopToken } from "@/lib/shop-plan";

/**
 * 店舗オーナー用セッション（?token= を URL に残さないための交換方式）。
 *
 * 管理URL（?token=xxx）で開かれたページは、クライアントがトークンを
 * POST /api/shop-auth/session に送って HttpOnly Cookie（shop_session）と交換し、
 * history.replaceState で URL からトークンを消す。以降の API は Cookie で認証する。
 *
 * Cookie には生トークンではなくランダムなセッションIDのみを入れ、DynamoDB には
 * そのSHA-256ハッシュをキーに { shop, トークンのハッシュ, 有効期限 } を保存する（30日TTL）。
 * 検証時に現在の店舗トークンのハッシュと照合するため、管理側でトークンを再発行すれば
 * 既存セッションも自動的に無効になる。
 * ※ 店舗トークン本体が DynamoDB にあるため、セッションも同じ DynamoDB に置く（Redis 非依存）。
 */
export const SHOP_SESSION_COOKIE = "shop_session";
export const SHOP_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

const SESSION_ID_RE = /^[A-Za-z0-9_-]{43}$/; // 32バイトの base64url

interface ShopSessionData {
  shop: string;
  /** 発行時の店舗トークンの SHA-256（トークン再発行でセッションを失効させるため） */
  th: string;
  /** 有効期限（epoch ミリ秒）。DynamoDB TTL の物理削除遅延（最大48h）に依存しないため自前でも判定 */
  exp: number;
}

function sha256(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

function sessionKey(id: string): string {
  return `SHOPSESSION#${sha256(id)}`;
}

/** トークン検証済みの店舗にセッションを発行し、Cookie に入れるセッションIDを返す */
export async function createShopSession(shop: string, token: string): Promise<string> {
  const id = randomBytes(32).toString("base64url");
  const data: ShopSessionData = {
    shop,
    th: sha256(token),
    exp: Date.now() + SHOP_SESSION_TTL_SECONDS * 1000,
  };
  await dbPut(sessionKey(id), "SESSION", data, SHOP_SESSION_TTL_SECONDS);
  return id;
}

/**
 * リクエストの shop_session Cookie から店舗slugを取得する（無効・期限切れ・トークン再発行済みは null）。
 * DynamoDB 障害時は例外を投げる（呼び出し側で 500 にすること）。
 */
export async function getShopFromSession(request: NextRequest): Promise<string | null> {
  const id = request.cookies.get(SHOP_SESSION_COOKIE)?.value;
  if (!id || !SESSION_ID_RE.test(id)) return null;
  const data = await dbGet<ShopSessionData>(sessionKey(id), "SESSION");
  if (!data || typeof data.shop !== "string" || typeof data.th !== "string") return null;
  if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
  const current = await dbGet<string>(`SHOP#${data.shop}`, "TOKEN");
  if (!current || !safeEqual(sha256(current), data.th)) return null;
  return data.shop;
}

/** セッションを破棄する（ログアウト用） */
export async function deleteShopSession(request: NextRequest): Promise<void> {
  const id = request.cookies.get(SHOP_SESSION_COOKIE)?.value;
  if (!id || !SESSION_ID_RE.test(id)) return;
  await dbDelete(sessionKey(id), "SESSION");
}

/**
 * 店舗オーナー認証。従来どおり body/header のトークン（後方互換）か、shop_session Cookie のどちらかで通す。
 * DynamoDB 障害時は例外を投げる（呼び出し側で 500 にすること。認証なしで通さない）。
 */
export async function verifyShopAuth(
  request: NextRequest,
  shop: string,
  token?: unknown,
): Promise<boolean> {
  if (!shop) return false;
  if (typeof token === "string" && token.length > 0 && token.length <= 200) {
    if (await verifyShopToken(shop, token)) return true;
  }
  return (await getShopFromSession(request)) === shop;
}

/** shop_session Cookie をレスポンスに設定する */
export function setShopSessionCookie(res: NextResponse, id: string): void {
  res.cookies.set(SHOP_SESSION_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SHOP_SESSION_TTL_SECONDS,
  });
}

/** shop_session Cookie を削除する */
export function clearShopSessionCookie(res: NextResponse): void {
  res.cookies.set(SHOP_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
