/**
 * 釣果週報（microCMS の blogs: chouka-shuho-{area}-{WEEKTAG}）を読み、カルーセル用に整形する。
 * microCMS の認証情報があれば API、無ければ公開サイト（sitemap + 記事HTML）から読む。どちらも同じ表パーサを通す。
 */

const SITE = "https://tsurispot.com";

/** "2026-11-week2" → { year, month, weekN, label: "11月第2週", range: "11/8〜11/14" } */
export function parseWeekTag(tag) {
  const m = /^(\d{4})-(\d{2})-week(\d)$/.exec(tag ?? "");
  if (!m) throw new Error(`WEEKTAG の形式が不正: ${tag}`);
  const [year, month, weekN] = [+m[1], +m[2], +m[3]];
  const last = new Date(year, month, 0).getDate();
  const from = (weekN - 1) * 7 + 1;
  const to = weekN === 5 ? last : Math.min(weekN * 7, last);
  return { tag, year, month, weekN, label: `${month}月第${weekN}週`, range: `${month}/${from}〜${month}/${to}` };
}

/** 今日(JST)が属する WEEKTAG。週報スキルと同じ区切り（1-7日=第1週 …） */
export function currentWeekTag(now = new Date()) {
  const j = new Date(now.getTime() + 9 * 3600e3);
  const d = j.getUTCDate();
  return `${j.getUTCFullYear()}-${String(j.getUTCMonth() + 1).padStart(2, "0")}-week${Math.min(5, Math.ceil(d / 7))}`;
}

function cms() {
  const domain = (process.env.MICROCMS_SERVICE_DOMAIN ?? "").trim();
  const key = (process.env.MICROCMS_API_KEY ?? "").trim();
  return domain && key ? { base: `https://${domain}.microcms.io/api/v1/blogs`, headers: { "X-MICROCMS-API-KEY": key } } : null;
}

/** 最新の週報が属する WEEKTAG（microCMS の publishedAt 降順の先頭） */
export async function latestWeekTag() {
  const c = cms();
  if (c) {
    const q = new URLSearchParams({ limit: "1", orders: "-publishedAt", fields: "slug", filters: "slug[contains]chouka-shuho" });
    const r = await fetch(`${c.base}?${q}`, { headers: c.headers });
    if (!r.ok) throw new Error(`microCMS HTTP ${r.status}`);
    const slug = (await r.json()).contents?.[0]?.slug ?? "";
    return /\d{4}-\d{2}-week\d/.exec(slug)?.[0] ?? null;
  }
  const tags = (await sitemapSlugs()).map((s) => /\d{4}-\d{2}-week\d/.exec(s)?.[0]).filter(Boolean).sort();
  return tags.at(-1) ?? null;
}

async function sitemapSlugs() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/\/blog\/(chouka-shuho-[a-z0-9-]+)</g)].map((m) => m[1]);
}

/** その週の全エリアの記事 [{ slug, area, title, publishedAt, html }] */
export async function fetchWeekArticles(tag) {
  const c = cms();
  if (c) {
    const q = new URLSearchParams({ limit: "50", fields: "slug,title,content,publishedAt", filters: `slug[contains]${tag}` });
    const r = await fetch(`${c.base}?${q}`, { headers: c.headers });
    if (!r.ok) throw new Error(`microCMS HTTP ${r.status}`);
    return (await r.json()).contents
      .filter((a) => a.slug.startsWith("chouka-shuho-") && a.slug.endsWith(tag))
      .map((a) => ({ slug: a.slug, title: a.title, publishedAt: a.publishedAt, html: a.content ?? "" }));
  }
  const slugs = [...new Set((await sitemapSlugs()).filter((s) => s.endsWith(tag)))];
  return Promise.all(slugs.map(async (slug) => {
    const html = await (await fetch(`${SITE}/blog/${slug}`)).text();
    const title = (/<title>([^<]*)/.exec(html)?.[1] ?? "").replace(/\s*\|\s*ツリスポ.*$/, "");
    return { slug, title: decode(title), publishedAt: null, html };
  }));
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
const text = (s) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

/**
 * 記事 → { area, catchCopy, rows:[{spot, fish, size, method, heat}] }
 * 表は「今週の釣果速報（一覧）」直後の table。好調度は 🔥 の数（❄️/— は 0）。
 */
export function parseArticle(a) {
  const area = /【釣果週報】(.+?)エリア/.exec(a.title)?.[1] ?? a.slug;
  const catchCopy = (a.title.split("｜")[1] ?? "").trim();
  const start = a.html.indexOf("今週の釣果速報");
  const table = start >= 0 ? /<table[\s\S]*?<\/table>/.exec(a.html.slice(start))?.[0] ?? "" : "";
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
    .map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => text(c[1])))
    .filter((cells) => cells.length >= 5)
    .map(([spot, fish, size, method, heatRaw]) => ({ spot, fish, size, method, heat: (heatRaw.match(/🔥/g) ?? []).length }));
  return { slug: a.slug, area, catchCopy, rows, url: `${SITE}/blog/${a.slug}` };
}

/** スライドに載せる上位の釣果（好調度順・同じ魚種は1回まで） */
export function topRows(rows, n = 3) {
  const seen = new Set();
  return [...rows]
    .map((r, i) => ({ ...r, i }))
    .sort((a, b) => b.heat - a.heat || a.i - b.i)
    .filter((r) => (seen.has(r.fish) ? false : seen.add(r.fish)))
    .slice(0, n);
}
