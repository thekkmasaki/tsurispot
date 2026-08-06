import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dbScanPrefix, dbConditionalPut } from "@/lib/dynamodb";
import { POST_TTL_SECONDS, FEED_TTL_SECONDS, type PostMeta } from "@/lib/social-store";

export const runtime = "nodejs";
export const maxDuration = 300;

// POST /api/admin/backfill-posts?mode=dry|execute
//  - Authorization: Bearer <ADMIN_MIGRATE_TOKEN>（migrate-redis-to-dynamo と同一トークン）
//  - 既存の釣果（SPOT#{slug}/UGC_REPORTS 配列 + Redis recent_reports:global + auth:user_reports:*）を
//    id 単位でマージし、POST#{id}/META を投入する（パーマリンク /posts/[id] の正本）。
//  - dbConditionalPut を使い、既に META がある投稿（=新コード経由の投稿）は上書きしない。
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_MIGRATE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_MIGRATE_TOKEN 環境変数が未設定" },
      { status: 500 },
    );
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const execute = new URL(request.url).searchParams.get("mode") === "execute";
  const posts = new Map<string, PostMeta>();

  const collect = (raw: unknown) => {
    const item =
      typeof raw === "string" ? (JSON.parse(raw) as Partial<PostMeta>) : (raw as Partial<PostMeta>);
    if (!item?.id || !item.spotSlug || !item.fishName) return;
    // 同一idが複数ソースにある場合は最初の採用を維持（DynamoDB配列 → global → user の順で信頼）
    if (!posts.has(item.id)) posts.set(item.id, item as PostMeta);
  };

  // 1) DynamoDB: 全スポットの UGC_REPORTS 配列（最も網羅的なソース）
  const spotArrays = await dbScanPrefix<PostMeta[]>("SPOT#", "UGC_REPORTS");
  for (const { data } of spotArrays) {
    for (const r of data ?? []) collect(r);
  }

  // 2) Redis: recent_reports:global（匿名投稿を含む・最新50件）
  try {
    const globalRaw = (await redis.lrange("recent_reports:global", 0, -1)) as unknown[];
    for (const r of globalRaw ?? []) collect(r);
  } catch (err) {
    console.error("[backfill-posts] recent_reports:global 読み取りエラー:", err);
  }

  // 3) Redis: auth:user_reports:*（配列の200件上限からこぼれた古い投稿の救済）
  try {
    let cursor = "0";
    let guard = 0;
    do {
      const res = (await redis.scan(cursor, {
        match: "auth:user_reports:*",
        count: 500,
      })) as [string, string[]] | null;
      if (!res) break;
      cursor = res[0];
      for (const key of res[1] ?? []) {
        const raw = (await redis.lrange(key, 0, -1)) as unknown[];
        for (const r of raw ?? []) collect(r);
      }
    } while (cursor !== "0" && ++guard < 100);
  } catch (err) {
    console.error("[backfill-posts] auth:user_reports 読み取りエラー:", err);
  }

  if (!execute) {
    return NextResponse.json({
      mode: "dry",
      total: posts.size,
      sample: [...posts.keys()].slice(0, 10),
    });
  }

  let written = 0;
  let skipped = 0;
  let feedWritten = 0;
  for (const post of posts.values()) {
    const created = await dbConditionalPut(`POST#${post.id}`, "META", post, POST_TTL_SECONDS);
    if (created) written++;
    else skipped++;

    // 全体タイムライン（/timeline）参照も投入。submittedAt が無い旧投稿は date(釣行日)を使う
    const iso = post.submittedAt ?? (post.date ? `${post.date}T00:00:00.000Z` : null);
    if (iso) {
      const month = iso.slice(0, 7).replace("-", "");
      const feedCreated = await dbConditionalPut(
        `FEED#GLOBAL#${month}`,
        `TS#${iso}#${post.id}`,
        { reportId: post.id, tsuriId: post.tsuriId },
        FEED_TTL_SECONDS,
      );
      if (feedCreated) feedWritten++;
    }
  }

  return NextResponse.json({ mode: "execute", total: posts.size, written, skipped, feedWritten });
}
