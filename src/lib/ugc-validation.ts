import { getSpotBySlug } from "@/lib/data/spots";
import { ownS3KeyFromUrl } from "@/lib/s3";

export const SPOT_SLUG_RE = /^[a-z0-9-]{1,100}$/;

/** 形式と実在の両方を満たすスポットだけを返す。不正なら null。 */
export function resolveSpot(slug: unknown) {
  if (typeof slug !== "string" || !SPOT_SLUG_RE.test(slug)) return null;
  return getSpotBySlug(slug) ?? null;
}

/** YYYY-MM-DD が実在する暦日か（2026-99-99 や 2026-02-30 を弾く）。 */
export function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 2000 || y > 2100) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function todayJst(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
}

/** Content-Length が上限を超えていれば true（ヘッダ無しは判定不能なので false）。 */
export function isBodyTooLarge(request: Request, maxBytes: number): boolean {
  const len = Number(request.headers.get("content-length"));
  return Number.isFinite(len) && len > maxBytes;
}

const DEFAULT_JSON_LIMIT = 32 * 1024;

/** サイズ上限付きでJSONを読む。不正/超過は null。 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = DEFAULT_JSON_LIMIT,
): Promise<T | null> {
  if (isBodyTooLarge(request, maxBytes)) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/** 自社S3バケットのオブジェクトURLで、かつ期待するキー接頭辞配下か（外部URL・トラッキングピクセル混入防止）。 */
export function isOwnImageUrl(url: unknown, keyPrefix: string): url is string {
  if (typeof url !== "string" || url.length > 500) return false;
  const key = ownS3KeyFromUrl(url);
  return key !== null && key.startsWith(keyPrefix);
}
