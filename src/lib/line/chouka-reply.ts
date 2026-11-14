/**
 * LINE の釣果系の返信本文（純関数）。主要10エリアの最新週報の釣果表から作る。
 * 一斉配信（友だち数×1通で無料枠を超える）の代わりに、聞かれたときだけ返す（返信は配信数に数えない）。
 *
 * - 「釣果」: マイエリアの今週の釣果を先頭に、全国の好調エリア上位3つ → /chouka
 * - 魚の名前（「アジ」「タチウオ釣れてる？」）: その魚が今釣れている場所 → /chouka/fish/{slug}
 */
import type { LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";
import { MAIN_WEEKLY_AREA_SLUGS, WEEKLY_REPORT_AREAS, catchRowHasFish } from "@/lib/weekly-report-areas";

const SITE = "https://tsurispot.com";
const utm = (campaign: string) => `utm_source=line&utm_medium=reply&utm_campaign=${campaign}`;
export const CHOUKA_URL = `${SITE}/chouka?${utm("chouka")}`;
const fishUrl = (slug: string) => `${SITE}/chouka/fish/${slug}?${utm("fish")}`;
const MAX_AREAS = 3;
const MAX_MY_AREA_ROWS = 3;
const MAX_FISH_ROWS = 5;
const HEAD = (title: string) => ["━━━━━━━━━━━━━━", title, "━━━━━━━━━━━━━━"];

export interface LineArea {
  slug: string;
  label: string;
}

/** マイエリア（都道府県名 例: 神奈川県）→ 週報の主要10エリア。週報の無い県は null */
export function weeklyAreaForPrefecture(prefName: string | null | undefined): LineArea | null {
  if (!prefName) return null;
  const a = WEEKLY_REPORT_AREAS.find((x) => MAIN_WEEKLY_AREA_SLUGS.includes(x.slug) && x.prefectures.includes(prefName));
  return a ? { slug: a.slug, label: a.label } : null;
}

const byHeat = (a: LatestWeeklyCatch, b: LatestWeeklyCatch) =>
  b.heat - a.heat || b.publishedAt.localeCompare(a.publishedAt);

const fire = (heat: number) => (heat > 0 ? "🔥".repeat(Math.min(heat, 3)) : "・");
const sizeText = (r: LatestWeeklyCatch) => (r.size && r.size !== "—" && r.size !== "-" ? ` ${r.size}` : "");

/** 1エリア1行（そのエリアで一番好調な行）。好調度の高い順に最大3エリア */
export function pickLineHighlights(rows: LatestWeeklyCatch[], excludeArea?: string): LatestWeeklyCatch[] {
  const best = new Map<string, LatestWeeklyCatch>();
  for (const r of rows) {
    if (r.heat <= 0 || r.areaSlug === excludeArea) continue;
    const cur = best.get(r.areaSlug);
    if (!cur || r.heat > cur.heat) best.set(r.areaSlug, r);
  }
  return [...best.values()].sort(byHeat).slice(0, MAX_AREAS);
}

export function buildChoukaReplyText(rows: LatestWeeklyCatch[], myArea?: LineArea | null): string {
  const lines = HEAD("📊 今週の釣果ピックアップ");

  const mine = myArea ? rows.filter((r) => r.areaSlug === myArea.slug).sort(byHeat).slice(0, MAX_MY_AREA_ROWS) : [];
  if (myArea && mine.length) {
    lines.push("", `📍 マイエリア（${myArea.label}）`);
    for (const r of mine) lines.push(`${fire(r.heat)} ${r.fish}${sizeText(r)}（${r.spot}）`);
  }

  const picks = pickLineHighlights(rows, mine.length ? myArea?.slug : undefined);
  if (picks.length) {
    lines.push("", mine.length ? "🗾 全国の好調エリア" : "🗾 今週の好調エリア");
    for (const r of picks) lines.push(`${fire(r.heat)} ${r.areaLabel}`, `　${r.fish}${sizeText(r)}（${r.spot}）`);
  }

  if (!mine.length && !picks.length) lines.push("", "全国10エリアの最新釣果を", "毎週まとめています！");
  lines.push("", "▼ ほかのエリア・魚の最新釣果", CHOUKA_URL);
  if (!myArea) lines.push("", "📍都道府県名を送ると、", "あなたのエリアの釣果を先頭に出します");
  return lines.join("\n");
}

export interface LineFish {
  slug: string;
  name: string;
  aliases?: string[];
}

/** 魚名として扱う最大文字数（「アジ釣れてる？」程度まで。長文の質問は拾わない） */
const MAX_FISH_QUERY_LEN = 15;

/**
 * 送られた文から魚を1種特定する（名前・別名の最長一致）。見つからなければ null。
 * 1文字の名前は誤爆する（「エ」→「エサ」）ので使わない。ただし魚偏の漢字1文字（鯵・鯛・鰤）は使う。
 */
const usableName = (n: string) => n.length >= 2 || /^\p{Script=Han}$/u.test(n);
export function findFishInText(text: string, fishList: readonly LineFish[]): LineFish | null {
  const t = text.trim();
  if (!t || t.length > MAX_FISH_QUERY_LEN) return null;
  let hit: LineFish | null = null;
  let hitLen = 0;
  for (const f of fishList) {
    for (const n of [f.name, ...(f.aliases ?? [])]) {
      if (usableName(n) && n.length > hitLen && t.includes(n)) {
        hit = f;
        hitLen = n.length;
      }
    }
  }
  return hit;
}

export function buildFishReplyText(fish: LineFish, rows: LatestWeeklyCatch[], myArea?: LineArea | null): string {
  const lines = HEAD(`🐟 ${fish.name}が今釣れている場所`);
  const hits = rows
    .filter((r) => catchRowHasFish(r.fish, fish))
    .sort((a, b) => Number(b.areaSlug === myArea?.slug) - Number(a.areaSlug === myArea?.slug) || byHeat(a, b));

  if (!hits.length) {
    lines.push(
      "",
      `今週の釣果週報では、${fish.name}の`,
      "報告はありませんでした。",
      "",
      `▼ ${fish.name}の釣り方・釣れる時期`,
      `${SITE}/fish/${fish.slug}?${utm("fish")}`,
      "",
      "▼ 今釣れている魚をエリア別に",
      CHOUKA_URL,
    );
    return lines.join("\n");
  }

  lines.push("");
  for (const r of hits.slice(0, MAX_FISH_ROWS)) {
    const mark = r.areaSlug === myArea?.slug ? "📍" : fire(r.heat);
    lines.push(`${mark} ${r.areaLabel}`, `　${r.spot}${sizeText(r)}${r.method ? `・${r.method}` : ""}`);
  }
  if (hits.length > MAX_FISH_ROWS) lines.push(`ほか${hits.length - MAX_FISH_ROWS}か所`);
  lines.push("", `▼ ${fish.name}の最新釣果をすべて見る`, fishUrl(fish.slug));
  return lines.join("\n");
}
