import { NextRequest, NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { regions } from "@/lib/data/regions";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { getAllBlogPosts } from "@/lib/data/blog";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import { tackleShops } from "@/lib/data/shops";
import { FISHING_METHODS, MONTHS } from "@/lib/data/fishing-methods";
import { REGION_GROUPS } from "@/lib/data/regions-group";

// IndexNow APIキー（public/{key}.txt に配置済み）
const INDEXNOW_KEY = "03845770c729578716b88beda009b743";
const HOST = "tsurispot.com";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * サイト全URLを収集する（sitemap.tsと同じデータソース）
 */
async function collectAllUrls(): Promise<string[]> {
  const urls: string[] = [];

  // 固定ページ
  const staticPages = [
    "", "/spots", "/fish", "/map", "/catchable-now", "/ranking", "/tides",
    "/fishing-calendar", "/for-beginners", "/fishing",
    "/fishing-spots/breakwater-beginner", "/fishing-spots/best-saltwater",
    "/fishing-spots/river-beginner", "/fishing-spots/near-me",
    "/guide", "/guide/beginner", "/guide/setup", "/guide/sabiki",
    "/guide/choinage", "/guide/casting", "/guide/float-fishing",
    "/guide/anazuri", "/guide/oyogase", "/guide/eging", "/guide/jigging",
    "/guide/lure", "/guide/entou-kago", "/guide/knots", "/guide/line",
    "/guide/sinker", "/guide/rigs", "/guide/tide", "/guide/night-fishing",
    "/guide/family", "/guide/budget", "/guide/handling", "/guide/fish-handling",
    "/guide/how-to-fish", "/guide/fishing-tips", "/guide/fishing-for-beginners",
    "/guide/fishing-gear-guide", "/guide/jet-sinker",
    "/gear", "/gear/sabiki", "/gear/rod-beginner", "/gear/tackle-box",
    "/methods", "/methods/sabiki", "/methods/ajing", "/methods/eging",
    "/methods/mebaring", "/methods/shore-jigging", "/methods/choi-nage",
    "/methods/uki-zuri", "/methods/ana-zuri", "/methods/tachiuo-zuri",
    "/glossary", "/glossary-quiz", "/seasonal", "/beginner-checklist",
    "/fishing-rules", "/faq", "/faq/beginner", "/faq/season", "/faq/spot",
    "/faq/technique", "/safety", "/recommendation", "/fish-finder", "/quiz",
    "/bouzu-checker", "/shops", "/sitemap-page", "/contact", "/partner",
    "/umigyo", "/umigyo/for-municipalities", "/about",
    "/legal", "/privacy", "/terms",
    "/blog", "/area-guide", "/monthly", "/prefecture", "/area",
  ];
  for (const page of staticPages) {
    urls.push(`${BASE_URL}${page}`);
  }

  // ブログ記事
  const blogPosts = await getAllBlogPosts();
  for (const post of blogPosts) {
    urls.push(`${BASE_URL}/blog/${post.slug}`);
  }

  // エリアガイド
  for (const guide of areaGuides) {
    urls.push(`${BASE_URL}/area-guide/${guide.slug}`);
  }

  // 月別ガイド
  for (const guide of monthlyGuides) {
    urls.push(`${BASE_URL}/monthly/${guide.slug}`);
  }

  // スポット詳細
  for (const spot of fishingSpots) {
    urls.push(`${BASE_URL}/spots/${spot.slug}`);
  }

  // 魚種詳細
  for (const fish of fishSpecies) {
    urls.push(`${BASE_URL}/fish/${fish.slug}`);
  }

  // 都道府県
  for (const pref of prefectures) {
    urls.push(`${BASE_URL}/prefecture/${pref.slug}`);
  }

  // エリア
  for (const region of regions) {
    urls.push(`${BASE_URL}/area/${region.slug}`);
  }

  // 釣り方×月マトリクス
  for (const method of FISHING_METHODS) {
    urls.push(`${BASE_URL}/fishing/${method.slug}`);
    for (const month of MONTHS) {
      urls.push(`${BASE_URL}/fishing/${method.slug}/${month.slug}`);
    }
  }

  // 季節ガイド
  for (const guide of seasonalGuides) {
    urls.push(`${BASE_URL}/seasonal/${guide.slug}`);
  }

  // 釣具店
  for (const shop of tackleShops) {
    urls.push(`${BASE_URL}/shops/${shop.slug}`);
  }

  // 都道府県×魚種
  const seen = new Set<string>();
  for (const spot of fishingSpots) {
    const pref = prefectures.find(p => p.name === spot.region.prefecture);
    if (!pref) continue;
    for (const cf of spot.catchableFish) {
      const key = `${pref.slug}|${cf.fish.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        urls.push(`${BASE_URL}/prefecture/${pref.slug}/fish/${cf.fish.slug}`);
      }
    }
  }

  // 月×地域
  const MONTHS_SLUGS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const REGION_SLUGS = [
    "hokkaido", "tohoku", "kanto", "chubu", "kinki", "chugoku", "shikoku", "kyushu-okinawa",
  ];
  for (const month of MONTHS_SLUGS) {
    for (const region of REGION_SLUGS) {
      urls.push(`${BASE_URL}/seasonal/${month}/${region}`);
    }
  }

  // 釣り方×地域
  for (const method of FISHING_METHODS) {
    for (const region of REGION_GROUPS) {
      urls.push(`${BASE_URL}/fishing/${method.slug}/area/${region.slug}`);
    }
  }

  // 都道府県別釣りルール
  for (const pref of prefectures) {
    urls.push(`${BASE_URL}/fishing-rules/${pref.slug}`);
  }

  return urls;
}

/**
 * IndexNow APIにURLリストを送信する
 * 10,000件ずつバッチに分割して送信
 */
async function submitToIndexNow(urlList: string[]): Promise<{ submitted: number; batches: number; status: number[] }> {
  const BATCH_SIZE = 500;
  const statuses: number[] = [];
  let batches = 0;

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    batches++;

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      }),
    });

    statuses.push(response.status);

    // バッチ間に1秒待機（レートリミット対策）
    if (i + BATCH_SIZE < urlList.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { submitted: urlList.length, batches, status: statuses };
}

/**
 * GET: 全サイトURLをIndexNowに一括送信
 */
export async function GET() {
  const urls = await collectAllUrls();
  const result = await submitToIndexNow(urls);

  return NextResponse.json({
    success: true,
    message: `IndexNowに${result.submitted}件のURLを送信しました（${result.batches}バッチ）`,
    ...result,
  });
}

/**
 * POST: 指定されたURLリストをIndexNowに送信
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const urls: string[] = body.urls;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { success: false, message: "urlsパラメータ（文字列配列）が必要です" },
      { status: 400 }
    );
  }

  const result = await submitToIndexNow(urls);

  return NextResponse.json({
    success: true,
    message: `IndexNowに${result.submitted}件のURLを送信しました（${result.batches}バッチ）`,
    ...result,
  });
}
