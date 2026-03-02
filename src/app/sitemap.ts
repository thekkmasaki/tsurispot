import type { MetadataRoute } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { regions } from "@/lib/data/regions";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { blogPosts, getAllBlogPosts } from "@/lib/data/blog";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import { tackleShops } from "@/lib/data/shops";
import { FISHING_METHODS, MONTHS } from "@/lib/data/fishing-methods";

const baseUrl = "https://tsurispot.com";

// ビルド時の日付を固定（毎回 new Date() にしない）
const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

// コンテンツ種別ごとのlastmod日付
// 頻繁に更新されるページ: ビルド日
const dynamicDate = new Date(BUILD_DATE);
// ガイド・固定コンテンツ: 最後の大規模更新日
const contentDate = new Date("2026-02-23");
// ほぼ変更しない法務系ページ
const legalDate = new Date("2025-06-01");

// カテゴリID: 0=static+guides, 1=spots, 2=fish, 3=prefectures+areas, 4=fishing-matrix+seasonal+shops
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  // Next.js 16: id is Promise<string> from URL params
  const sitemapId = Number(await id);

  // 0: 固定ページ + ガイド系 + ブログ + エリアガイド + 月別ガイド
  if (sitemapId === 0) {
    return [
      // トップ・主要ページ（動的コンテンツ）
      { url: baseUrl, lastModified: dynamicDate, changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/spots`, lastModified: dynamicDate, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/fish`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/map`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/catchable-now`, lastModified: dynamicDate, changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/ranking`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/tides`, lastModified: dynamicDate, changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/fishing-calendar`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/for-beginners`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/fishing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
      // 目的別釣り場ページ
      { url: `${baseUrl}/fishing-spots/breakwater-beginner`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/best-saltwater`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/river-beginner`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/near-me`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
      // ガイド（全28ページ）
      { url: `${baseUrl}/guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/setup`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/choinage`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/casting`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/float-fishing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/anazuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/oyogase`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/eging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/jigging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/lure`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/entou-kago`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/knots`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/line`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/sinker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/rigs`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/tide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/night-fishing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/family`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/budget`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/handling`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fish-handling`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/how-to-fish`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-tips`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-for-beginners`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-gear-guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/jet-sinker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      // 装備ガイド
      { url: `${baseUrl}/gear`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/rod-beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/tackle-box`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      // 釣り方別
      { url: `${baseUrl}/methods`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/methods/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ajing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/eging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/mebaring`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/shore-jigging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/choi-nage`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/uki-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ana-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/tachiuo-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      // その他固定ページ
      { url: `${baseUrl}/glossary`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/glossary-quiz`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/seasonal`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/beginner-checklist`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/fishing-rules`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/faq`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/faq/beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/season`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/spot`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/technique`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/safety`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/recommendation`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/fish-finder`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/quiz`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/bouzu-checker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/shops`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/sitemap-page`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.4 },
      { url: `${baseUrl}/partner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/umigyo`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/umigyo/for-municipalities`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/about`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/legal`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/privacy`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/terms`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
      // ブログ（静的 + microCMS記事）
      { url: `${baseUrl}/blog`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.7 },
      ...(await getAllBlogPosts()).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : contentDate,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      // エリアガイド
      { url: `${baseUrl}/area-guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.8 },
      ...areaGuides.map((guide) => ({
        url: `${baseUrl}/area-guide/${guide.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      // 月別ガイド
      { url: `${baseUrl}/monthly`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
      ...monthlyGuides.map((guide) => ({
        url: `${baseUrl}/monthly/${guide.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  }

  // 1: スポット詳細ページ
  if (sitemapId === 1) {
    return fishingSpots.map((spot) => ({
      url: `${baseUrl}/spots/${spot.slug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // 2: 魚種詳細ページ
  if (sitemapId === 2) {
    return fishSpecies.map((fish) => ({
      url: `${baseUrl}/fish/${fish.slug}`,
      lastModified: contentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  // 3: 都道府県・エリアページ
  if (sitemapId === 3) {
    return [
      { url: `${baseUrl}/prefecture`, lastModified: dynamicDate, changeFrequency: "weekly" as const, priority: 0.9 },
      ...prefectures.map((pref) => ({
        url: `${baseUrl}/prefecture/${pref.slug}`,
        lastModified: dynamicDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      { url: `${baseUrl}/area`, lastModified: dynamicDate, changeFrequency: "weekly" as const, priority: 0.9 },
      ...regions.map((region) => ({
        url: `${baseUrl}/area/${region.slug}`,
        lastModified: dynamicDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  // 5: 都道府県×魚種ページ
  if (sitemapId === 5) {
    const combos: { prefSlug: string; fishSlug: string }[] = [];
    const seen = new Set<string>();
    for (const spot of fishingSpots) {
      const pref = prefectures.find(p => p.name === spot.region.prefecture);
      if (!pref) continue;
      for (const cf of spot.catchableFish) {
        const key = `${pref.slug}|${cf.fish.slug}`;
        if (!seen.has(key)) {
          seen.add(key);
          combos.push({ prefSlug: pref.slug, fishSlug: cf.fish.slug });
        }
      }
    }
    return combos.map(c => ({
      url: `${baseUrl}/prefecture/${c.prefSlug}/fish/${c.fishSlug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  }

  // 6: 月×地域ページ
  if (sitemapId === 6) {
    const MONTHS_SLUGS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const REGION_SLUGS = ["hokkaido","tohoku","kanto","chubu","kinki","chugoku","shikoku","kyushu-okinawa"];
    return MONTHS_SLUGS.flatMap(month =>
      REGION_SLUGS.map(region => ({
        url: `${baseUrl}/seasonal/${month}/${region}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );
  }

  // 4: 釣り方×月マトリクス + 季節ガイド + 釣具店
  return [
    // 釣り方×月マトリクス（method概要 + method×month個別ページ）
    ...FISHING_METHODS.flatMap((method) => [
      {
        url: `${baseUrl}/fishing/${method.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...MONTHS.map((month) => ({
        url: `${baseUrl}/fishing/${method.slug}/${month.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]),
    // 季節ガイド
    ...seasonalGuides.map((guide) => ({
      url: `${baseUrl}/seasonal/${guide.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // 釣具店
    ...tackleShops.map((shop) => ({
      url: `${baseUrl}/shops/${shop.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
