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

// カテゴリID: 0=static+guides, 1=spots, 2=fish, 3=prefectures+areas, 4=fishing-matrix+seasonal+shops
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Next.js 16: id is Promise<string> from URL params
  const sitemapId = Number(await id);

  // 0: 固定ページ + ガイド系 + ブログ + エリアガイド + 月別ガイド
  if (sitemapId === 0) {
    return [
      // トップ・主要ページ
      { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/spots`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/fish`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/catchable-now`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/ranking`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/tides`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/fishing-calendar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/for-beginners`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/fishing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      // 目的別釣り場ページ
      { url: `${baseUrl}/fishing-spots/breakwater-beginner`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/best-saltwater`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/river-beginner`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/fishing-spots/near-me`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      // ガイド（全28ページ）
      { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/setup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/choinage`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/casting`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/float-fishing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/anazuri`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/oyogase`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/eging`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/jigging`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/lure`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/entou-kago`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/knots`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/line`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/sinker`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/rigs`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/tide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/night-fishing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/family`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/budget`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/handling`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fish-handling`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/how-to-fish`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-tips`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-for-beginners`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/fishing-gear-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/jet-sinker`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      // 装備ガイド
      { url: `${baseUrl}/gear`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/rod-beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/tackle-box`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      // 釣り方別
      { url: `${baseUrl}/methods`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/methods/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ajing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/eging`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/mebaring`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/shore-jigging`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/choi-nage`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/uki-zuri`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ana-zuri`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/tachiuo-zuri`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      // その他固定ページ
      { url: `${baseUrl}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/glossary-quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/seasonal`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/beginner-checklist`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/fishing-rules`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/faq/beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/season`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/spot`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/faq/technique`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/recommendation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/fish-finder`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/bouzu-checker`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/shops`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/sitemap-page`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${baseUrl}/partner`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/umigyo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/umigyo/for-municipalities`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      // ブログ（静的 + microCMS記事）
      { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      ...(await getAllBlogPosts()).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      // エリアガイド
      { url: `${baseUrl}/area-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      ...areaGuides.map((guide) => ({
        url: `${baseUrl}/area-guide/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      // 月別ガイド
      { url: `${baseUrl}/monthly`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      ...monthlyGuides.map((guide) => ({
        url: `${baseUrl}/monthly/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  }

  // 1: スポット詳細ページ
  if (sitemapId === 1) {
    return fishingSpots.map((spot) => ({
      url: `${baseUrl}/spots/${spot.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // 2: 魚種詳細ページ
  if (sitemapId === 2) {
    return fishSpecies.map((fish) => ({
      url: `${baseUrl}/fish/${fish.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  // 3: 都道府県・エリアページ
  if (sitemapId === 3) {
    return [
      { url: `${baseUrl}/prefecture`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
      ...prefectures.map((pref) => ({
        url: `${baseUrl}/prefecture/${pref.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      { url: `${baseUrl}/area`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
      ...regions.map((region) => ({
        url: `${baseUrl}/area/${region.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  // 4: 釣り方×月マトリクス + 季節ガイド + 釣具店
  return [
    // 釣り方×月マトリクス（method概要 + method×month個別ページ）
    ...FISHING_METHODS.flatMap((method) => [
      {
        url: `${baseUrl}/fishing/${method.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...MONTHS.map((month) => ({
        url: `${baseUrl}/fishing/${method.slug}/${month.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]),
    // 季節ガイド
    ...seasonalGuides.map((guide) => ({
      url: `${baseUrl}/seasonal/${guide.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // 釣具店
    ...tackleShops.map((shop) => ({
      url: `${baseUrl}/shops/${shop.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
