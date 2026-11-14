import { isIP } from "node:net";
import { dbIncr } from "@/lib/dynamodb";
import { safeEqual } from "@/lib/safe-compare";

/**
 * IPベースの簡易レート制限（DynamoDBのカウンタ+TTLを利用）。
 *
 * shop-listing で使っていた dbIncr パターンを共有化したもの。書込/課金系API
 * (画像アップロード=S3+Rekognition課金, UGC投稿, IndexNow送信 等) の濫用・コスト暴走・
 * スパムを防ぐために各 POST 冒頭で呼ぶ。
 *
 * 既定はフェイルオープン: DynamoDB障害時は true（通す）を返し、本来の機能を止めない。
 * 匿名の書き込み系で濫用リスクが高いAPIは opts.failClosed を指定すると、障害時に false（拒否）になる。
 *
 * キーにウィンドウ番号を含める固定ウィンドウ方式。dbIncr のTTLは初回設定のみ
 * （延長されない）＋ DynamoDB TTLの物理削除は最大48時間遅延するため、
 * 単一キーだとカウンタが窓を超えて生き残り「10分10件」が実質「最大48hで10件」になる。
 * ウィンドウ番号でキー自体を回転させれば削除遅延の影響を受けない。
 */
export async function checkRateLimit(
  ip: string,
  bucket: string,
  limit: number,
  windowSeconds: number,
  opts?: { failClosed?: boolean },
): Promise<boolean> {
  try {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const count = await dbIncr(`RATELIMIT#${ip}#${window}`, bucket, 1, windowSeconds * 2);
    return count <= limit;
  } catch {
    return !opts?.failClosed;
  }
}

function validIp(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v || v.length > 45) return null;
  return isIP(v) ? v : null;
}

/**
 * リクエストヘッダからクライアントIPを推定する。
 * 不正な値（IP形式でない文字列）はレート制限キーの汚染を防ぐため採用しない。
 *
 * ORIGIN_VERIFY_SECRET 設定時（Cloudflare が秘密ヘッダ x-origin-verify を付与する前提）:
 *   - x-origin-verify が一致（定数時間比較）した場合のみ cf-connecting-ip を信頼する
 *   - 一致しない（= オリジン直アクセス）場合は cf-connecting-ip / x-forwarded-for 先頭を
 *     偽装可能とみなし、x-forwarded-for の右端（自前のロードバランサが付与した値）を使う
 * ORIGIN_VERIFY_SECRET 未設定時: 従来どおり cf-connecting-ip → x-forwarded-for 先頭
 *   （インフラ設定が完了するまで本番挙動を変えないため）。
 */
export function getClientIp(request: Request): string {
  const h = request.headers;
  const secret = process.env.ORIGIN_VERIFY_SECRET;
  if (secret) {
    if (safeEqual(h.get("x-origin-verify"), secret)) {
      const cf = validIp(h.get("cf-connecting-ip"));
      if (cf) return cf;
    }
    return (
      validIp(h.get("x-forwarded-for")?.split(",").pop()) ||
      validIp(h.get("x-real-ip")) ||
      "unknown"
    );
  }
  return (
    validIp(h.get("cf-connecting-ip")) ||
    validIp(h.get("x-forwarded-for")?.split(",")[0]) ||
    validIp(h.get("x-real-ip")) ||
    "unknown"
  );
}
