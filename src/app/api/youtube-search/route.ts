import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/** 1日のYouTube API呼び出し上限（100回 = 10,000ユニット） */
const MAX_DAILY_API_CALLS = 80; // 余裕を持って80回に制限
const DAILY_COUNT_KEY = "yt_api_daily_count";
const CACHE_PREFIX = "yt_cache:";
const CACHE_TTL = 60 * 60 * 24 * 30; // 30日

interface CachedVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ videos: [] });
  }

  const cacheKey = `${CACHE_PREFIX}${q}`;

  // 1. Redisキャッシュを確認
  try {
    const cached = await redis.get<CachedVideo[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json(
        { videos: cached, source: "cache" },
        { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } },
      );
    }
  } catch {
    // Redis未設定 or エラー → APIで取得を試みる
  }

  // 2. 1日のAPI呼び出し回数を確認
  try {
    const dailyCount = await redis.get<number>(DAILY_COUNT_KEY);
    if ((dailyCount ?? 0) >= MAX_DAILY_API_CALLS) {
      return NextResponse.json({ videos: [] });
    }
  } catch {
    // Redis未設定時はそのまま続行
  }

  // 3. YouTube Data API v3 を呼び出し
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "2");
    url.searchParams.set("regionCode", "JP");
    url.searchParams.set("relevanceLanguage", "ja");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error("YouTube API error:", res.status, await res.text());
      return NextResponse.json({ videos: [] });
    }

    const data = await res.json();
    const videos: CachedVideo[] = (data.items ?? []).map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high: { url: string } } } }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }));

    // 4. Redisに保存（30日間）
    if (videos.length > 0) {
      try {
        await redis.set(cacheKey, videos, { ex: CACHE_TTL });
      } catch {
        // Redis保存失敗は無視
      }
    }

    // 5. API呼び出し回数をインクリメント
    try {
      const exists = await redis.exists(DAILY_COUNT_KEY);
      await redis.incr(DAILY_COUNT_KEY);
      if (!exists) {
        await redis.expire(DAILY_COUNT_KEY, 86400); // 24時間で自動リセット
      }
    } catch {
      // 無視
    }

    return NextResponse.json(
      { videos },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } },
    );
  } catch (e) {
    console.error("YouTube search failed:", e);
    return NextResponse.json({ videos: [] });
  }
}
