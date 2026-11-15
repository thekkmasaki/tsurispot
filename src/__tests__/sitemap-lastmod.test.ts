import { describe, it, expect, vi, beforeAll } from "vitest";
import type { MetadataRoute } from "next";

// sitemap.ts の外部依存（Redis / Next キャッシュ / microCMS / 週報）をスタブ化
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...a: unknown[]) => unknown) => fn,
}));
vi.mock("@/lib/redis", () => ({
  redis: { scan: async () => ["0", []] },
}));
vi.mock("@/lib/data/blog", () => ({ getAllBlogPosts: async () => [] }));
vi.mock("@/lib/data/weekly-fish-latest", () => ({ getFishWithLatestCatches: async () => [] }));

import sitemap from "@/app/sitemap";
import { MIN_SPOTS_PER_PREF } from "@/lib/data/spot-features";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";

/**
 * sitemap の lastmod 実態化・掲載範囲の回帰テスト（2026-11）
 * - 旧実装はビルド日をそのまま lastmod にしており、デプロイ毎に全URLが「今日更新」になっていた。
 * - 薄い spot-type×県（MIN_SPOTS_PER_PREF 未満）は noindex なので sitemap に載せない。
 * - 漏れていた釣り宿・釣行レポート・投稿ランキングを掲載する。
 */
describe("sitemap.xml", () => {
  let entries: MetadataRoute.Sitemap;
  const today = new Date().toISOString().slice(0, 10);
  const ymd = (d: MetadataRoute.Sitemap[number]["lastModified"]) =>
    d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);

  beforeAll(async () => {
    entries = await sitemap();
  }, 120_000);

  it("ビルド日（今日）の lastmod は潮見表・最新釣果ページ以外にほぼ無い", () => {
    const todays = entries.filter(
      (e) => ymd(e.lastModified) === today && !/\/(tides|chouka)(\/|$)/.test(e.url),
    );
    // データが今日コミットされた場合は今日になり得るので「全件今日」でないことを確認する
    expect(todays.length).toBeLessThan(entries.length * 0.5);
  });

  it("スポット詳細の lastmod は一律ではなく、データファイル単位でばらつく", () => {
    const spotDates = new Set(
      entries.filter((e) => e.url.includes("/spots/")).map((e) => ymd(e.lastModified)),
    );
    expect(spotDates.size).toBeGreaterThan(1);
  });

  it("漏れていた釣り宿・釣行レポート・投稿ランキングを含む", () => {
    const urls = new Set(entries.map((e) => e.url));
    expect(urls.has("https://tsurispot.com/accommodations")).toBe(true);
    expect(urls.has("https://tsurispot.com/catch-reports")).toBe(true);
    expect(urls.has("https://tsurispot.com/ranking/reporters")).toBe(true);
  });

  it("MIN_SPOTS_PER_PREF 件未満の spot-type×県 は載せない", () => {
    const prefBySlug = new Map(prefectures.map((p) => [p.slug, p.name]));
    for (const e of entries) {
      const m = e.url.match(/\/spot-type\/([a-z]+)\/([a-z-]+)$/);
      if (!m) continue;
      const count = fishingSpots.filter(
        (s) => s.spotType === m[1] && s.region.prefecture === prefBySlug.get(m[2]),
      ).length;
      expect(count, e.url).toBeGreaterThanOrEqual(MIN_SPOTS_PER_PREF);
    }
  });

  it("URL の重複がない", () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
