/**
 * サーバー専用: 釣果週報（microCMS）の「釣果速報（一覧）」表から、スポットにリンクされた行を
 * スポット slug ごとにまとめる。スポット詳細の「最新釣果」（title/description/冒頭）と
 * /chouka の「最近釣果があった釣り場」で使う。
 *
 * - 対象: 全15エリアの週報のうち公開から SPOT_CATCH_FRESH_DAYS 以内、各エリア最新 3 本まで。
 * - 表のスポットセルに /spots/{slug} リンクがある行だけを採用（名前の推測マッチはしない＝誤帰属防止）。
 * - 結果全体を unstable_cache（1時間・tag "blog-posts"）に載せ、microCMS 本文取得は 1時間に最大45本。
 *   スポットページ 1 リクエストあたりの追加 I/O はキャッシュ読み 1 回のみ。
 * - 取得失敗時は空（呼び出し側は釣果文言を出さない）。
 *
 * fishingSpots を import しない（依存を増やさない）。クライアントから import 禁止。
 */
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getAllBlogPosts, getBlogPostBySlugAsync } from "./blog";
import { getCatchReportsBySpotAsync } from "./catch-reports";
import {
  listWeeklyPostsForArea,
  parseWeeklyCatchRows,
  WEEKLY_REPORT_AREAS,
} from "@/lib/weekly-report-areas";
import {
  SPOT_CATCH_FRESH_DAYS,
  buildSpotCatchSummary,
  type SpotCatchSummary,
  type SpotWeeklyCatchRow,
} from "@/lib/spot-catch-summary";

const POSTS_PER_AREA = 3;

const fetchWeeklyCatchesBySpot = unstable_cache(
  async (): Promise<Record<string, SpotWeeklyCatchRow[]>> => {
    const posts = await getAllBlogPosts();
    const now = Date.now();
    const out: Record<string, SpotWeeklyCatchRow[]> = {};
    for (const area of WEEKLY_REPORT_AREAS) {
      const recent = listWeeklyPostsForArea(posts, area.slug)
        .filter((p) => {
          const t = Date.parse(`${p.publishedAt.slice(0, 10)}T00:00:00+09:00`);
          return !Number.isNaN(t) && (now - t) / 86_400_000 <= SPOT_CATCH_FRESH_DAYS;
        })
        .slice(0, POSTS_PER_AREA);
      for (const p of recent) {
        const post = await getBlogPostBySlugAsync(p.slug);
        if (!post) continue;
        for (const row of parseWeeklyCatchRows(post.content)) {
          if (!row.spotHref) continue;
          const slug = row.spotHref.replace(/^\/spots\//, "");
          (out[slug] ??= []).push({
            publishedAt: p.publishedAt.slice(0, 10),
            fish: row.fish,
            size: row.size,
            method: row.method,
            heat: row.heat,
            articleHref: `/blog/${p.slug}`,
            areaSlug: area.slug,
            areaLabel: area.label,
            spotLabel: row.spot,
          });
        }
      }
    }
    for (const rows of Object.values(out)) rows.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return out;
  },
  ["spot-weekly-catches-v1"],
  { revalidate: 3600, tags: ["blog-posts"] },
);

/** スポット slug → 週報の釣果行（新しい順）。失敗時は空オブジェクト */
export const getWeeklyCatchesBySpot = cache(async (): Promise<Record<string, SpotWeeklyCatchRow[]>> => {
  try {
    return await fetchWeeklyCatchesBySpot();
  } catch (err) {
    console.error("[spot-weekly-catches] 週報釣果の取得に失敗:", err);
    return {};
  }
});

/** generateMetadata とページ本体で DynamoDB 取得を 1 回に揃えるためのリクエスト内メモ化 */
export const getCatchReportsBySpotCached = cache(getCatchReportsBySpotAsync);

/** スポットの最新釣果サマリー（UGC＋週報）。実データが無ければ null */
export const getSpotCatchSummary = cache(async (slug: string): Promise<SpotCatchSummary | null> => {
  const [ugc, bySpot] = await Promise.all([getCatchReportsBySpotCached(slug), getWeeklyCatchesBySpot()]);
  return buildSpotCatchSummary({ ugc, weekly: bySpot[slug] ?? [] });
});
