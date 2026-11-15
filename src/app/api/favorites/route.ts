import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbBatchGet, dbIncr, dbDecr } from "@/lib/dynamodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody, resolveSpot } from "@/lib/ugc-validation";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { createHash } from "crypto";

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
  if (action !== "increment" && action !== "decrement") {
    return NextResponse.json({ error: "action must be increment or decrement" }, { status: 400 });
  }

  // 同じ人（ログイン中は tsuriId、匿名は IP）×同じスポットで +1 は1回まで。
  // -1 は自分の +1 の印があるときだけ（他人の分を減らせない・0 未満にもしない）
  const marker = favMarkerKey(await favoriteActorId(request), slug);
  const current = async () => (await dbGet<number>(`SPOT#${slug}`, "FAVCOUNT")) || 0;

  if (action === "increment") {
    const acquired = await redis.set(marker, 1, { nx: true, ex: FAV_MARKER_TTL_SECONDS });
    if (acquired === null) {
      // すでに数えた分は数え直さない（現在値だけ返す）
      return NextResponse.json({ slug, count: await current() });
    }
    const count = await dbIncr(`SPOT#${slug}`, "FAVCOUNT");
    return NextResponse.json({ slug, count });
  }

  const removed = await redis.del(marker);
  if (removed === 0) {
    return NextResponse.json({ slug, count: await current() });
  }
  try {
    const count = await dbDecr(`SPOT#${slug}`, "FAVCOUNT");
    return NextResponse.json({ slug, count });
  } catch {
    // すでに 0（条件付き更新が失敗）なら 0 のまま
    return NextResponse.json({ slug, count: 0 });
  }
}

// お気に入り数の重複カウント防止の印（30日）
const FAV_MARKER_TTL_SECONDS = 30 * 24 * 60 * 60;

/** 印のキー。IP は生で残さずハッシュ化する */
function favMarkerKey(actor: string, slug: string): string {
  return `favmark:${actor}:${slug}`;
}

/** ログイン中は tsuriId、匿名は IP のハッシュで「同じ人」を判定する */
async function favoriteActorId(request: NextRequest): Promise<string> {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;
    if (tsuriId) return `u:${tsuriId}`;
  } catch {
    // セッション取得に失敗したら匿名扱い
  }
  const ipHash = createHash("sha256").update(getClientIp(request)).digest("hex").slice(0, 32);
  return `ip:${ipHash}`;
}
