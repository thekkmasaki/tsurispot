import { NextResponse } from "next/server";

// 各検索エンジンにsitemap更新を通知するエンドポイント
// デプロイ後に手動で1回叩く: curl https://tsurispot.com/api/ping-search-engines
export async function GET() {
  const sitemapUrl = "https://tsurispot.com/sitemap.xml";
  const results: Record<string, string> = {};

  // Bing/IndexNow ping
  try {
    const bingRes = await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    );
    results.bing = bingRes.ok ? "ok" : `error: ${bingRes.status}`;
  } catch (e) {
    results.bing = `error: ${e}`;
  }

  // IndexNow notification (Bing + Yandex + others)
  try {
    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: "tsurispot.com",
        key: "tsurispot2026indexnow",
        keyLocation: "https://tsurispot.com/indexnow-key.txt",
        urlList: [
          "https://tsurispot.com",
          "https://tsurispot.com/spots",
          "https://tsurispot.com/fish",
          "https://tsurispot.com/ranking",
          "https://tsurispot.com/catchable-now",
          "https://tsurispot.com/area-guide",
          "https://tsurispot.com/seasonal",
          "https://tsurispot.com/blog",
          "https://tsurispot.com/fishing-spots/near-me",
          "https://tsurispot.com/fishing-spots/breakwater-beginner",
        ],
      }),
    });
    results.indexNow = indexNowRes.ok ? "ok" : `error: ${indexNowRes.status}`;
  } catch (e) {
    results.indexNow = `error: ${e}`;
  }

  return NextResponse.json({
    message: "Search engine ping results",
    results,
    timestamp: new Date().toISOString(),
  });
}
