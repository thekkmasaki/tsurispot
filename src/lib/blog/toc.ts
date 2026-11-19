/**
 * ブログ本文（HTML文字列）の h2 に id を振り、目次用の見出し一覧を返す。
 *
 * 2026-11 UX監査: 特集記事に目次が無く、長い記事で目的の章へ飛べなかった。
 * 本文は静的記事・microCMS とも HTML 文字列なので、描画前に文字列のまま処理する。
 * 既に id を持つ h2 はその id を使う（記事内アンカーを壊さない）。
 */
export interface TocItem {
  id: string;
  text: string;
}

const H2_RE = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g;

export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  let n = 0;
  const out = html.replace(H2_RE, (whole, attrs: string | undefined, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!text) return whole;
    n += 1;
    const existing = attrs?.match(/\sid=["']([^"']+)["']/)?.[1];
    let id = existing ?? `sec-${n}`;
    while (!existing && used.has(id)) id = `${id}-x`;
    used.add(id);
    toc.push({ id, text });
    return existing ? whole : `<h2${attrs ?? ""} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}
