import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ videos: [] });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", q);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "2");
    url.searchParams.set("regionCode", "JP");
    url.searchParams.set("relevanceLanguage", "ja");
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // 24h cache
    if (!res.ok) {
      console.error("YouTube API error:", res.status, await res.text());
      return NextResponse.json({ videos: [] });
    }

    const data = await res.json();
    const videos = (data.items ?? []).map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { high: { url: string } } } }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }));

    return NextResponse.json(
      { videos },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } },
    );
  } catch (e) {
    console.error("YouTube search failed:", e);
    return NextResponse.json({ videos: [] });
  }
}
