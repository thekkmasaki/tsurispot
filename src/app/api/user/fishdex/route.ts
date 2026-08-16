import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { fishSpecies } from "@/lib/data/fish";
import { splitFishNames } from "@/lib/fish-name";

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

  // 釣果投稿由来の caught に加えて、「釣ったことある」1タップ分（匿名からのマージ含む）を合成。
  // fishdex_removed は「投稿由来だがユーザーが図鑑上で取り消した」slug（取り消しが復活しないように）
  const [raw, extraRaw, removedRaw] = await Promise.all([
    redis.lrange(`auth:user_reports:${userId}`, 0, 999),
    redis.smembers(`auth:fishdex_extra:${userId}`),
    redis.smembers(`auth:fishdex_removed:${userId}`),
  ]);
  const reports = parseReports(raw as unknown[]);
  const extraSlugs = new Set(
    ((extraRaw as unknown[]) || []).filter(
      (s): s is string => typeof s === "string",
    ),
  );
  const removedSlugs = new Set(
    ((removedRaw as unknown[]) || []).filter(
      (s): s is string => typeof s === "string",
    ),
  );

  // ユーザが釣った魚名 (Set) + 各魚種の最大サイズ。
  // 「アジ、サバ」のような複数魚種の投稿は魚種単位に分割してから集計する
  const caughtSet = new Set<string>();
  const maxByFish: Record<string, number> = {};
  const firstCatchByFish: Record<string, string> = {};
  for (const r of reports) {
    for (const name of splitFishNames(r.fishName)) {
      caughtSet.add(name);
      if (typeof r.sizeCm === "number" && r.sizeCm > (maxByFish[name] ?? 0)) {
        maxByFish[name] = r.sizeCm;
      }
      if (r.date) {
        const existing = firstCatchByFish[name];
        if (!existing || r.date < existing) {
          firstCatchByFish[name] = r.date;
        }
      }
    }
  }

  const fish = fishSpecies.map((f) => ({
    slug: f.slug,
    name: f.name,
    imageUrl: `/images/fish/${f.slug}.jpg`,
    caught:
      extraSlugs.has(f.slug) ||
      (caughtSet.has(f.name) && !removedSlugs.has(f.slug)),
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

  // 釣果投稿由来の slug のうち、クライアントの一覧に無いもの = ユーザーが図鑑上で取り消したもの。
  // これを記録しないと GET の合成で毎回復活してしまう（取り消しできないバグになる）
  const raw = await redis.lrange(`auth:user_reports:${userId}`, 0, 999);
  const reports = parseReports(raw as unknown[]);
  const slugByName = new Map(fishSpecies.map((f) => [f.name, f.slug]));
  const received = new Set(slugs);
  const removed: string[] = [];
  const seen = new Set<string>();
  for (const r of reports) {
    for (const name of splitFishNames(r.fishName)) {
      const slug = slugByName.get(name);
      if (slug && !received.has(slug) && !seen.has(slug)) {
        seen.add(slug);
        removed.push(slug);
      }
    }
  }

  const extraKey = `auth:fishdex_extra:${userId}`;
  const removedKey = `auth:fishdex_removed:${userId}`;
  // MULTI で del→sadd をアトミックに（隙間の GET が空集合を観測しないように）
  const tx = redis.multi();
  tx.del(extraKey);
  if (slugs.length > 0) {
    tx.sadd(extraKey, slugs[0], ...slugs.slice(1));
  }
  tx.del(removedKey);
  if (removed.length > 0) {
    tx.sadd(removedKey, removed[0], ...removed.slice(1));
  }
  await tx.exec();

  return NextResponse.json({ ok: true, count: slugs.length });
}
