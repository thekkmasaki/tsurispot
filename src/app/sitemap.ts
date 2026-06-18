import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
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
import { FISHING_METHODS, MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";
import { REGION_GROUPS } from "@/lib/data/regions-group";
import { getEligiblePrefFishCombos } from "@/lib/data";
import { redis } from "@/lib/redis";
import { getUserById } from "@/lib/auth-redis";
import { isSitemapEligible } from "@/lib/seo-quality";

const baseUrl = "https://tsurispot.com";

// ISR化: 旧版は getSitemapUsers の Redis SCAN を毎リクエスト実行しƒ(動的)・低速(~25s)だった。
// getSitemapUsers を unstable_cache 化し、ルートもISRにして配信を高速化する。
export const revalidate = 3600;
// force-static: revalidate / unstable_cache だけでは auto 判定で ƒ(毎回XML再生成・28s) のまま
// だったため、静的(○)を強制してビルド時1回生成＋1hごとISRにする。Redis SCAN は getSitemapUsers の
// try/catch 内なので、万一 force-static 下で失敗してもユーザーURLが空になるだけでビルドは壊れない。
export const dynamic = "force-static";

// ビルド時の日付を固定（毎回 new Date() にしない）
const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD形式

// コンテンツ種別ごとのlastmod日付
// dynamicDate: ビルド時の日付（スポット・都道府県等のデータ連動ページ）
// contentDate: ビルド日と同期（コンテンツ更新もビルド時に反映されるため）
// legalDate: 法務ページは手動更新のため固定
const dynamicDate = new Date(BUILD_DATE);
const contentDate = new Date(BUILD_DATE);
const legalDate = new Date("2025-06-01");

// 月ごとの lastModified（マトリクスページ用: その月の1日に固定）
const BUILD_YEAR = new Date(BUILD_DATE).getUTCFullYear();
const monthDate = (num: number) =>
  new Date(Date.UTC(BUILD_YEAR, num - 1, 1));

// 釣果1件以上 & isPublic!=false のユーザーを sitemap に含める
// (Redis SCAN は数百ユーザー規模なら問題ないが、将来規模拡大時は別途インデックス化検討)
// 釣果1件以上 & isPublic!=false のユーザーを sitemap に含める。
// unstable_cache でキャッシュ境界を作り、毎リクエストの Redis SCAN + N回 getUserById を回避。
// updatedAt はキャッシュ境界をまたぐため Date ではなく ISO文字列で返す（Date復元のブレを避ける）。
const getSitemapUsers = unstable_cache(
  async (): Promise<{ tsuriId: string; updatedAt: string }[]> => {
    try {
      const userIds: string[] = [];
      let cursor: string | number = 0;
      let iterations = 0;
      do {
        const result = (await redis.scan(cursor, {
          match: "auth:user:*",
          count: 200,
        })) as [string | number, string[]];
        cursor = result[0];
        for (const key of result[1] || []) {
          const id = key.replace(/^auth:user:/, "");
          if (id) userIds.push(id);
        }
        iterations++;
        if (iterations > 50) break; // 安全弁: 1万ユーザー上限
      } while (cursor !== "0" && cursor !== 0);

      const users = await Promise.all(
        userIds.map(async (id) => {
          const u = await getUserById(id);
          if (!u) return null;
          if (u.isPublic === false) return null;
          if ((u.reportCount || 0) < 1) return null;
          return { tsuriId: id, updatedAt: new Date(u.createdAt).toISOString() };
        }),
      );
      return users.filter((u): u is { tsuriId: string; updatedAt: string } => Boolean(u));
    } catch (err) {
      console.error("[sitemap] getSitemapUsers failed:", err);
      return [];
    }
  },
  ["sitemap-users"],
  { revalidate: 3600, tags: ["sitemap-users"] }
);

// 単一サイトマップ（generateSitemapsを削除 → Google が確実に取得できる1ファイル構成）
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapUsers = await getSitemapUsers();
  // 都道府県×魚種の組み合わせを事前計算 (品質フィルタ: その都道府県でその魚が3スポット以上)
  // generateStaticParams (prefecture/[slug]/fish/[fishSlug]) と共有ヘルパで統一し、
  // 「インデックス対象 = 事前生成対象」を保証する。
  const prefFishCombos = getEligiblePrefFishCombos(3);

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
    { url: `${baseUrl}/guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/setup`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/choinage`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/casting`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/float-fishing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/anazuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/oyogase`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/eging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/jigging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/lure`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/entou-kago`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/knots`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/line`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/sinker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/rigs`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/tide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/night-fishing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/family`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/budget`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/handling`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/fish-handling`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/how-to-fish`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/fishing-tips`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/fishing-for-beginners`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/fishing-gear-guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/jet-sinker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/beginner-setup`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/fish-recipes`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guide/troubleshooting`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    // 装備ガイド
    { url: `${baseUrl}/gear`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/gear/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/gear/rod-beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/gear/tackle-box`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    // 釣り方別
    { url: `${baseUrl}/methods`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/sabiki`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/ajing`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/eging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/mebaring`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/shore-jigging`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/choi-nage`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/uki-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/ana-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/methods/tachiuo-zuri`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    // その他固定ページ
    { url: `${baseUrl}/glossary`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/glossary-quiz`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/seasonal`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/beginner-checklist`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/fishing-rules`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq/beginner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq/season`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq/spot`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq/technique`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/safety`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/recommendation`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/fish-finder`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/fish-knowledge`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/seasonal-fish`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/fishing-methods`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/spot-detective`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/danger-fish`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/glossary`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/rules-manners`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/quiz/local`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/bouzu-checker`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shops`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/sitemap-page`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/partner`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/technology`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/umigyo`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    // 釣りインストラクター試験対策
    { url: `${baseUrl}/instructor-exam`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/law`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/manners`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/tackle`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/law/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/manners/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/tackle/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/safety`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/safety/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/history`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/history/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/technique`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/technique/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/environment`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/environment/quiz`, lastModified: contentDate, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/essay`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/instructor-exam/practical`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/umigyo/for-municipalities`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/legal`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: legalDate, changeFrequency: "yearly", priority: 0.3 },
    // ブログ
    { url: `${baseUrl}/blog`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt
        ? new Date(post.updatedAt)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // エリアガイド
    { url: `${baseUrl}/area-guide`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    ...areaGuides.map((guide) => ({
      url: `${baseUrl}/area-guide/${guide.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // 月別ガイド
    { url: `${baseUrl}/monthly`, lastModified: contentDate, changeFrequency: "monthly", priority: 0.5 },
    ...monthlyGuides.map((guide) => ({
      url: `${baseUrl}/monthly/${guide.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ===== スポット詳細ページ（画像サイトマップ付き）=====
    // 品質フィルタ厳格化: description >= 100 AND catchableFish >= 2
    // （判定基準は src/lib/seo-quality.ts に一元化）
    ...fishingSpots
      .filter((spot) => isSitemapEligible(spot))
      .map((spot) => {
        const spotUpdatedAt = (spot as unknown as { updatedAt?: string }).updatedAt;
        return {
          url: `${baseUrl}/spots/${spot.slug}`,
          lastModified: spotUpdatedAt ? new Date(spotUpdatedAt) : dynamicDate,
          changeFrequency: "weekly" as const,
          priority: 0.7,
          images: spot.mainImageUrl?.startsWith("http") ? [spot.mainImageUrl] : [],
        };
      }),

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
    // 都道府県別 全スポット一覧ページ（マイナースポットへの内部リンク経路）
    ...prefectures
      .filter((pref) => fishingSpots.some((s) => s.region.prefecture === pref.name))
      .map((pref) => ({
        url: `${baseUrl}/prefecture/${pref.slug}/all`,
        lastModified: dynamicDate,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    { url: `${baseUrl}/area`, lastModified: dynamicDate, changeFrequency: "weekly", priority: 0.9 },
    // 低コンテンツarea（スポット1件以下）はサイトマップから除外
    ...regions
      .filter((region) => {
        const spotCount = fishingSpots.filter((s) => s.region.id === region.id).length;
        return spotCount >= 2;
      })
      .map((region) => ({
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
        priority: 0.5,
      },
      ...MONTHS.map((month) => ({
        url: `${baseUrl}/fishing/${method.slug}/${month.slug}`,
        lastModified: monthDate(month.num),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ]),
    // 季節カテゴリページ（春夏秋冬）
    ...seasonCategories.map((season) => ({
      url: `${baseUrl}/seasonal/${season.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // 季節ガイド詳細ページ
    ...seasonalGuides.map((guide) => ({
      url: `${baseUrl}/seasonal/${guide.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...tackleShops.map((shop) => ({
      url: `${baseUrl}/shops/${shop.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ===== 都道府県別釣具店ページ =====
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/shops/area/${pref.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ===== 都道府県×魚種ページ =====
    ...prefFishCombos.map(c => ({
      url: `${baseUrl}/prefecture/${c.prefSlug}/fish/${c.fishSlug}`,
      lastModified: dynamicDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),

    // ===== 月×地域ページ =====
    ...MONTHS_SLUGS.flatMap((month, idx) =>
      REGION_SLUGS.map(region => ({
        url: `${baseUrl}/seasonal/${month}/${region}`,
        lastModified: monthDate(idx + 1),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    ),

    // ===== 釣り方×地域ページ + 都道府県別釣りルールページ =====
    ...FISHING_METHODS.flatMap((method) =>
      REGION_GROUPS.map((region) => ({
        url: `${baseUrl}/fishing/${method.slug}/area/${region.slug}`,
        lastModified: contentDate,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    ),
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/fishing-rules/${pref.slug}`,
      lastModified: contentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // ===== 都道府県×月ページ（品質フィルタ: catchableFish in monthRange が 3 種以上） =====
    ...(() => {
      const prefMonthCombos: { prefSlug: string; monthSlug: string; monthNum: number }[] = [];
      for (const pref of prefectures) {
        const prefSpots = fishingSpots.filter(s => s.region.prefecture === pref.name);
        for (const month of MONTHS) {
          const fishSet = new Set<string>();
          for (const spot of prefSpots) {
            for (const cf of spot.catchableFish) {
              if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
                fishSet.add(cf.fish.slug);
              }
            }
          }
          if (fishSet.size >= 3) {
            prefMonthCombos.push({ prefSlug: pref.slug, monthSlug: month.slug, monthNum: month.num });
          }
        }
      }
      return prefMonthCombos;
    })().map(c => ({
      url: `${baseUrl}/prefecture/${c.prefSlug}/${c.monthSlug}`,
      lastModified: monthDate(c.monthNum),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

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
      priority: 0.5,
    })),

    // ===== 都道府県×釣り方ページ（品質フィルタ: 3スポット以上） =====
    ...(() => {
      const prefMethodCombos: { prefSlug: string; methodSlug: string }[] = [];
      for (const pref of prefectures) {
        for (const method of FISHING_METHODS) {
          const count = fishingSpots.filter(
            (s) =>
              s.region.prefecture === pref.name &&
              s.catchableFish.some((cf) => method.methods.includes(cf.method))
          ).length;
          if (count >= 3) {
            prefMethodCombos.push({ prefSlug: pref.slug, methodSlug: method.slug });
          }
        }
      }
      return prefMethodCombos;
    })().map(c => ({
      url: `${baseUrl}/prefecture/${c.prefSlug}/fishing/${c.methodSlug}`,
      lastModified: dynamicDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    // 都道府県×月×魚種マトリクスページは sitemap から除外。
    // ページは ISR で生きてるが、Google「クロール済み未登録」の主因のため sitemap 非掲載で crawl budget 集中。

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

    // ===== ユーザープロフィール（釣果1件以上の公開ユーザー） =====
    ...sitemapUsers.map((u) => ({
      url: `${baseUrl}/users/${u.tsuriId}`,
      lastModified: new Date(u.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
