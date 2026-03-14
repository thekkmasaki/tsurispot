import type { MetadataRoute } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { regions } from "@/lib/data/regions";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { getAllBlogPosts } from "@/lib/data/blog";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import { seasons as seasonCategories } from "@/lib/data/seasonal-data";
import { tackleShops } from "@/lib/data/shops";
import { FISHING_METHODS, MONTHS } from "@/lib/data/fishing-methods";
import { REGION_GROUPS } from "@/lib/data/regions-group";

const baseUrl = "https://tsurispot.com";

// ビルド時の日付を固定（毎回 new Date() にしない）
const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

// コンテンツ種別ごとのlastmod日付
// dynamicDate: ビルド時の日付（スポット・都道府県等のデータ連動ページ）
// contentDate: ビルド日と同期（コンテンツ更新もビルド時に反映されるため）
// legalDate: 法務ページは手動更新のため固定
const dynamicDate = new Date(BUILD_DATE);
const contentDate = new Date(BUILD_DATE);
const legalDate = new Date("2025-06-01");

// 単一サイトマップ（generateSitemapsを削除 → Google が確実に取得できる1ファイル構成）
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 都道府県×魚種の組み合わせを事前計算
  const prefFishCombos: { prefSlug: string; fishSlug: string }[] = [];
  const seen = new Set<string>();
  for (const spot of fishingSpots) {
    const pref = prefectures.find(p => p.name === spot.region.prefecture);
    if (!pref) continue;
    for (const cf of spot.catchableFish) {
      const key = `${pref.slug}|${cf.fish.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        prefFishCombos.push({ prefSlug: pref.slug, fishSlug: cf.fish.slug });
      }
    }
  }

  const MONTHS_SLUGS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const REGION_SLUGS = ["hokkaido","tohoku","kanto","chubu","kinki","chugoku","shikoku","kyushu-okinawa"];

  const blogPosts = await getAllBlogPosts();

  return [
    // ===== 固定ページ・主要ページ =====
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
    { url: `${baseUrl}/guide/beginner-setup`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/fish-recipes`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guide/troubleshooting`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.6 },
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
    // ブログ
    { url: `${baseUrl}/blog`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((post) => ({
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

    // ===== スポット詳細ページ（画像サイトマップ付き）=====
    ...fishingSpots.map((spot) => ({
      url: `${baseUrl}/spots/${spot.slug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: spot.mainImageUrl?.startsWith("http") ? [spot.mainImageUrl] : [],
    })),

    // ===== 魚種詳細ページ =====
    ...fishSpecies.map((fish) => ({
      url: `${baseUrl}/fish/${fish.slug}`,
      lastModified: contentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // ===== 都道府県・エリアページ =====
    { url: `${baseUrl}/prefecture`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.9 },
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/prefecture/${pref.slug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${baseUrl}/area`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.9 },
    ...regions.map((region) => ({
      url: `${baseUrl}/area/${region.slug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // ===== 釣り方×月マトリクス + 季節ガイド + 釣具店 =====
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
    // 季節カテゴリページ（春夏秋冬）
    ...seasonCategories.map((season) => ({
      url: `${baseUrl}/seasonal/${season.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // 季節ガイド詳細ページ
    ...seasonalGuides.map((guide) => ({
      url: `${baseUrl}/seasonal/${guide.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...tackleShops.map((shop) => ({
      url: `${baseUrl}/shops/${shop.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    // ===== 都道府県別釣具店ページ =====
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/shops/area/${pref.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    // ===== 都道府県×魚種ページ =====
    ...prefFishCombos.map(c => ({
      url: `${baseUrl}/prefecture/${c.prefSlug}/fish/${c.fishSlug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),

    // ===== 月×地域ページ =====
    ...MONTHS_SLUGS.flatMap(month =>
      REGION_SLUGS.map(region => ({
        url: `${baseUrl}/seasonal/${month}/${region}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    ),

    // ===== 釣り方×地域ページ + 都道府県別釣りルールページ =====
    ...FISHING_METHODS.flatMap((method) =>
      REGION_GROUPS.map((region) => ({
        url: `${baseUrl}/fishing/${method.slug}/area/${region.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    ),
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/fishing-rules/${pref.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    // ===== 都道府県×月ページ (564ページ) =====
    ...prefectures.flatMap((pref) =>
      MONTHS.map((month) => ({
        url: `${baseUrl}/prefecture/${pref.slug}/${month.slug}`,
        lastModified: dynamicDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    ),

    // ===== 魚×釣り方ページ =====
    ...(() => {
      const fishMethodCombos: { fishSlug: string; methodSlug: string }[] = [];
      const seenFM = new Set<string>();
      for (const fish of fishSpecies) {
        if (!fish.fishingMethods || fish.fishingMethods.length === 0) continue;
        for (const fm of fish.fishingMethods) {
          for (const method of FISHING_METHODS) {
            if (method.methods.includes(fm.methodName)) {
              const key = `${fish.slug}|${method.slug}`;
              if (!seenFM.has(key)) {
                seenFM.add(key);
                fishMethodCombos.push({ fishSlug: fish.slug, methodSlug: method.slug });
              }
            }
          }
        }
      }
      return fishMethodCombos;
    })().map(c => ({
      url: `${baseUrl}/fish/${c.fishSlug}/method/${c.methodSlug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    // ===== 釣り場タイプページ =====
    { url: `${baseUrl}/spot-type`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.8 },
    ...["port", "beach", "rocky", "river", "pier", "breakwater"].map(type => ({
      url: `${baseUrl}/spot-type/${type}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // ===== 釣り場タイプ×都道府県ページ =====
    ...(() => {
      const spotTypePrefCombos: { type: string; prefSlug: string }[] = [];
      const seenSTP = new Set<string>();
      for (const spot of fishingSpots) {
        const pref = prefectures.find(p => p.name === spot.region.prefecture);
        if (!pref) continue;
        const key = `${spot.spotType}|${pref.slug}`;
        if (!seenSTP.has(key)) {
          seenSTP.add(key);
          spotTypePrefCombos.push({ type: spot.spotType, prefSlug: pref.slug });
        }
      }
      return spotTypePrefCombos;
    })().map(c => ({
      url: `${baseUrl}/spot-type/${c.type}/${c.prefSlug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
