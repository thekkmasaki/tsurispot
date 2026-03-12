import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const PREFIX = "fav:";

// GET /api/favorites?slug=xxx or ?slugs=a,b,c (一括)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const slugs = searchParams.get("slugs");

  if (slug) {
    const count = await redis.get<number>(`${PREFIX}${slug}`);
    return NextResponse.json({ slug, count: count || 0 }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  if (slugs) {
    const slugList = slugs.split(",").slice(0, 50); // 最大50件
    const keys = slugList.map(s => `${PREFIX}${s}`);
    const values = await redis.mget<(number | null)[]>(...keys);
    const counts: Record<string, number> = {};
    slugList.forEach((s, i) => { counts[s] = values[i] || 0; });
    return NextResponse.json({ counts }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  return NextResponse.json({ error: "slug or slugs required" }, { status: 400 });
}

// POST /api/favorites  body: { slug, action: "increment" | "decrement" }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { slug, action } = body as { slug?: string; action?: string };

  if (!slug || typeof slug !== "string" || slug.length > 100) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  if (action === "increment") {
    const count = await redis.incr(`${PREFIX}${slug}`);
    return NextResponse.json({ slug, count });
  } else if (action === "decrement") {
    const current = await redis.get<number>(`${PREFIX}${slug}`);
    if (current && current > 0) {
      const count = await redis.decr(`${PREFIX}${slug}`);
      return NextResponse.json({ slug, count });
    }
    return NextResponse.json({ slug, count: 0 });
  }

  return NextResponse.json({ error: "action must be increment or decrement" }, { status: 400 });
}
