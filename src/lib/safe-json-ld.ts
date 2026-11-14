/**
 * JSON-LD を <script type="application/ld+json"> に埋め込むための安全な直列化。
 *
 * JSON.stringify だけだと、文字列中の "</script>" や "<!--" でスクリプト要素が途中で閉じられ、
 * 記事タイトル・スポット名・口コミ等に混入した HTML がそのまま実行され得る（XSS）。
 * < > & と U+2028/U+2029 を JSON の \u エスケープに置き換える。JSON として等価なので
 * パース結果（検索エンジンが読む構造化データの内容）は JSON.stringify と完全に同一。
 */
const ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function safeJsonLd(value: unknown): string {
  const json = JSON.stringify(value);
  // JSON.stringify(undefined) は undefined を返す（従来どおり空のスクリプトになる）
  if (json === undefined) return "";
  return json.replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]);
}
