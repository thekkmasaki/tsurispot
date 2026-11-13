/**
 * 記事HTML内のアフィリエイトリンクに rel="sponsored" を付ける（表示時に補う）。
 *
 * microCMS のリッチテキストは保存時に rel="sponsored" を剥がしてしまうため、
 * 入稿側でいくら付けても本番HTMLから消える。Google のリンクポリシー上、
 * 報酬が発生するリンクには sponsored（または nofollow）が必要なので、描画直前にここで付け直す。
 * 既存の rel 値（noopener / noreferrer 等）は保持し、足りない値だけ追加する。
 */

/** 報酬が発生するリンクのホスト（サブドメインも含む） */
const AFFILIATE_HOSTS = [
  "amzn.to",
  "amazon.co.jp",
  "amazon.com",
  "a.r10.to",
  "hb.afl.rakuten.co.jp",
  "af.moshimo.com",
  "px.a8.net",
  "ck.jp.ap.valuecommerce.com",
  "click.linksynergy.com",
];

export function isAffiliateUrl(href: string): boolean {
  let host: string;
  try {
    host = new URL(href).hostname.toLowerCase();
  } catch {
    return false;
  }
  return AFFILIATE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

const REQUIRED_REL = ["sponsored", "noopener", "noreferrer"];

/** <a ...> 開始タグ単位で処理する（属性順・引用符の種類に依存しない） */
export function addSponsoredRel(html: string): string {
  if (!html) return html;
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = /\bhref\s*=\s*(["'])(.*?)\1/i.exec(tag)?.[2];
    if (!href || !isAffiliateUrl(href)) return tag;
    const relMatch = /\brel\s*=\s*(["'])(.*?)\1/i.exec(tag);
    const current = relMatch ? relMatch[2].split(/\s+/).filter(Boolean) : [];
    const merged = [...current];
    for (const r of REQUIRED_REL) if (!merged.some((c) => c.toLowerCase() === r)) merged.push(r);
    const rel = `rel="${merged.join(" ")}"`;
    if (relMatch) return tag.replace(relMatch[0], rel);
    return tag.replace(/^<a\b/i, `<a ${rel}`);
  });
}
