import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { isLowQualitySpot, isSitemapEligible } from "@/lib/seo-quality";

/**
 * SEO indexability ゲート（GSC「noindexで除外 / クロール済み未登録」の再発防止）
 *
 * 目的: sitemap.xml に載せる URL が本番で noindex を返す状態を CI で検出する。
 *   - sitemap 掲載は isSitemapEligible（desc>=100字 & 魚>=2種）
 *   - スポット詳細の noindex は isLowQualitySpot（desc<50字 & 魚<=1種）
 *   この2帯が重なると「sitemapで推しているのに noindex」= GSC が
 *   「検証に失敗しました」を出す原因になる。閾値変更でうっかり重ねないよう固定する。
 */
describe("SEO indexability: sitemap と noindex の整合", () => {
  it("sitemap掲載スポット(isSitemapEligible)は1件もnoindex(isLowQualitySpot)にならない", () => {
    const conflicts = fishingSpots
      .filter((s) => isSitemapEligible(s) && isLowQualitySpot(s))
      .map((s) => s.slug);
    expect(conflicts).toEqual([]);
  });

  it("品質ティアの閾値は重複しない（境界の合成ケース）", () => {
    // sitemap境界（100字・魚2種）は noindex にならない
    const boundary = { description: "あ".repeat(100), catchableFish: [1, 2] };
    expect(isSitemapEligible(boundary)).toBe(true);
    expect(isLowQualitySpot(boundary)).toBe(false);

    // 明確に薄い（10字・魚1種）は noindex帯であり sitemap には載らない
    const thin = { description: "あ".repeat(10), catchableFish: [1] };
    expect(isLowQualitySpot(thin)).toBe(true);
    expect(isSitemapEligible(thin)).toBe(false);
  });

  it("sitemap掲載対象スポットが十分な件数ある（sitemapが空でない）", () => {
    const eligible = fishingSpots.filter(isSitemapEligible);
    expect(eligible.length).toBeGreaterThan(1000);
  });
});
