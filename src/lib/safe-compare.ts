import { createHash, timingSafeEqual } from "crypto";

/** 定数時間の文字列比較（長さ違いでも同じ時間・例外なし） */
export function safeEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Authorization ヘッダが `Bearer <expected>` と一致するか（expected 未設定/空は常に false） */
export function isBearerMatch(authHeader: string | null | undefined, expected: string | undefined): boolean {
  if (!expected || !authHeader) return false;
  return safeEqual(authHeader, `Bearer ${expected}`);
}

/** 管理トークンの取得。用途別 env を優先し、未設定なら共通 env にフォールバックする。 */
export function resolveAdminToken(...envNames: string[]): string | undefined {
  for (const name of envNames) {
    const v = process.env[name];
    if (v) return v;
  }
  return undefined;
}
