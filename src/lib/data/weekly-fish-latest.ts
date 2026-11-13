/**
 * サーバー専用: 主要10エリアの最新週報に「今週報告のある魚」（件数の多い順）。
 * /chouka の「魚から探す」と sitemap の /chouka/fish/* で使う。
 */
import { cache } from "react";
import { fishSpecies } from "./fish";
import { getLatestWeeklyCatches } from "./weekly-report-latest";
import { catchRowHasFish } from "@/lib/weekly-report-areas";

export const getFishWithLatestCatches = cache(async (): Promise<{ slug: string; name: string; count: number }[]> => {
  const rows = await getLatestWeeklyCatches();
  return fishSpecies
    .map((f) => ({ slug: f.slug, name: f.name, count: rows.filter((r) => catchRowHasFish(r.fish, f)).length }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
});
