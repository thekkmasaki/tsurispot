/**
 * サーバー専用: スポットに対応する「最新の釣果週報」を返す。
 *
 * microCMS へは追加リクエストを発行しない。既存の getAllBlogPosts()
 * （unstable_cache 1時間・tag "blog-posts"・本文除外の一覧）を唯一のソースにし、
 * そこから週報だけを抽出してエリア→最新のマップを組む。
 * マップ構築は React cache でリクエスト内メモ化（同一リクエストの generateMetadata と
 * ページ本体で 1 回）。取得失敗時は空マップ（ブロック側で非表示）。
 *
 * fishingSpots を import しないので spot 側の依存を増やさない。クライアントから import 禁止。
 */
import { cache } from "react";
import { getAllBlogPosts } from "./blog";
import {
  getWeeklyAreaForSpot,
  pickLatestWeeklyByArea,
  type WeeklyReportSummary,
} from "@/lib/weekly-report-areas";

const buildLatestWeeklyMap = cache(async (): Promise<Map<string, WeeklyReportSummary>> => {
  try {
    const posts = await getAllBlogPosts();
    return pickLatestWeeklyByArea(posts);
  } catch (err) {
    console.error("[weekly-report-latest] 週報一覧の取得に失敗:", err);
    return new Map();
  }
});

/** スポットのエリアに対応する最新週報。エリア未対応・週報なし・古い場合は null */
export async function getLatestWeeklyReportForSpot(spot: {
  region: { prefecture: string };
  address: string;
}): Promise<WeeklyReportSummary | null> {
  const area = getWeeklyAreaForSpot(spot);
  if (!area) return null;
  const map = await buildLatestWeeklyMap();
  return map.get(area.slug) ?? null;
}
