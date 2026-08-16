import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { fishSpecies } from "@/lib/data/fish";

interface CatchReport {
  fishName?: string;
  sizeCm?: number;
  date?: string;
}

function parseReports(raw: unknown[]): CatchReport[] {
  return (raw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as CatchReport;
        } catch {
          return null;
        }
      }
      return item as CatchReport;
    })
    .filter((r): r is CatchReport => Boolean(r));
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  // 釣果投稿由来の caught に加えて、「釣ったことある」1タップ分（匿名からのマージ含む）を合成
  const [raw, extraRaw] = await Promise.all([
    redis.lrange(`auth:user_reports:${userId}`, 0, 999),
    redis.smembers(`auth:fishdex_extra:${userId}`),
  ]);
  const reports = parseReports(raw as unknown[]);
  const extraSlugs = new Set(
    ((extraRaw as unknown[]) || []).filter(
      (s): s is string => typeof s === "string",
    ),
  );

  // ユーザが釣った魚名 (Set) + 各魚種の最大サイズ
  const caughtSet = new Set<string>();
  const maxByFish: Record<string, number> = {};
  const firstCatchByFish: Record<string, string> = {};
  for (const r of reports) {
    if (!r.fishName) continue;
    caughtSet.add(r.fishName);
    if (typeof r.sizeCm === "number" && r.sizeCm > (maxByFish[r.fishName] ?? 0)) {
      maxByFish[r.fishName] = r.sizeCm;
    }
    if (r.date) {
      const existing = firstCatchByFish[r.fishName];
      if (!existing || r.date < existing) {
        firstCatchByFish[r.fishName] = r.date;
      }
    }
  }

  const fish = fishSpecies.map((f) => ({
    slug: f.slug,
    name: f.name,
    imageUrl: `/images/fish/${f.slug}.jpg`,
    caught: caughtSet.has(f.name) || extraSlugs.has(f.slug),
    maxSizeCm: maxByFish[f.name] ?? null,
    firstCaughtAt: firstCatchByFish[f.name] ?? null,
  }));

  const caughtCount = fish.filter((f) => f.caught).length;
  return NextResponse.json({
    total: fish.length,
    caughtCount,
    completionRate: Math.round((caughtCount / fish.length) * 100),
    fish,
  });
}

const MAX_EXTRA_SLUGS = 300;

/**
 * 「釣ったことある」記録の全置換（クライアント側で union merge した結果を受ける。
 * use-favorites と同じく last-write-wins）。
 */
export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  let body: { slugs?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  const validSlugs = new Set(fishSpecies.map((f) => f.slug));
  const slugs = Array.isArray(body.slugs)
    ? body.slugs
        .filter((s): s is string => typeof s === "string" && validSlugs.has(s))
        .slice(0, MAX_EXTRA_SLUGS)
    : [];

  const key = `auth:fishdex_extra:${userId}`;
  await redis.del(key);
  if (slugs.length > 0) {
    await redis.sadd(key, slugs[0], ...slugs.slice(1));
  }

  return NextResponse.json({ ok: true, count: slugs.length });
}
