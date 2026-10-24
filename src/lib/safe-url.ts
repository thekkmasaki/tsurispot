/** http(s) のみ許可（javascript: 等は除外）。正規化したURL文字列、不正なら null。クライアントでも利用可。 */
export function sanitizeHttpUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (v.length === 0 || v.length > 300) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}
