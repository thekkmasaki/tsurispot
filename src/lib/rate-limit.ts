import { isIP } from "node:net";
import { dbIncr } from "@/lib/dynamodb";

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
 * 本番は Cloudflare 前段のため cf-connecting-ip を最優先し、無ければ x-forwarded-for の先頭。
 * 注意: これらのヘッダはオリジン直アクセスでは偽装できる。偽装を防ぐには
 * ORIGIN_LOCKDOWN_MODE=enforce（Cloudflare経由のみ許可・src/proxy.ts）が前提となる。
 * 不正な値（IP形式でない文字列）はレート制限キーの汚染を防ぐため採用しない。
 */
export function getClientIp(request: Request): string {
  return (
    validIp(request.headers.get("cf-connecting-ip")) ||
    validIp(request.headers.get("x-forwarded-for")?.split(",")[0]) ||
    validIp(request.headers.get("x-real-ip")) ||
    "unknown"
  );
}
