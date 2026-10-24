import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbBatchGet, dbIncr, dbDecr } from "@/lib/dynamodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody, resolveSpot } from "@/lib/ugc-validation";

// GET /api/favorites?slug=xxx or ?slugs=a,b,c (一括)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const slugs = searchParams.get("slugs");

  if (slug) {
    const count = await dbGet<number>(`SPOT#${slug}`, "FAVCOUNT");
    return NextResponse.json({ slug, count: count || 0 }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  if (slugs) {
    const slugList = slugs.split(",").slice(0, 50); // 最大50件
    const keys = slugList.map(s => ({ pk: `SPOT#${s}`, sk: "FAVCOUNT" }));
    const values = await dbBatchGet<number>(keys);
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
  // 匿名で増減できるため、IP単位で濫用を抑える（DynamoDBアイテムの無限生成・人気数値の水増し対策）
  if (!(await checkRateLimit(getClientIp(request), "FAVORITES", 60, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }

  const body = await readJsonBody<{ slug?: string; action?: string }>(request, 1024);
  if (!body) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { action } = body;
  // 実在するスポットのslugのみ受け付ける（任意文字列でDynamoDBキーを作らせない）
  const spot = resolveSpot(body.slug);
  if (!spot) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const slug = spot.slug;

  if (action === "increment") {
    const count = await dbIncr(`SPOT#${slug}`, "FAVCOUNT");
    return NextResponse.json({ slug, count });
  } else if (action === "decrement") {
    const current = await dbGet<number>(`SPOT#${slug}`, "FAVCOUNT");
    if (current && current > 0) {
      const count = await dbDecr(`SPOT#${slug}`, "FAVCOUNT");
      return NextResponse.json({ slug, count });
    }
    return NextResponse.json({ slug, count: 0 });
  }

  return NextResponse.json({ error: "action must be increment or decrement" }, { status: 400 });
}
