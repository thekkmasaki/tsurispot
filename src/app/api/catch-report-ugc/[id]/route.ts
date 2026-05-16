import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { checkNgWords } from "@/lib/moderation";

interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  userName: string;
  tsuriId?: string;
  comment: string;
  date: string;
  approved: boolean;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
  submittedAt?: string;
}

const TTL_SECONDS = 365 * 24 * 60 * 60;
const ALLOWED_METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"];
const ALLOWED_WEATHER = ["晴れ", "曇り", "雨", "風強い"];

async function syncRedisItem(
  tsuriId: string,
  id: string,
  updatedReport: CatchReport | null,
): Promise<void> {
  try {
    const reports = await redis.lrange<string>(`auth:user_reports:${tsuriId}`, 0, -1);
    for (let i = 0; i < reports.length; i++) {
      const item = reports[i];
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed?.id !== id) continue;
      if (updatedReport === null) {
        await redis.lrem(`auth:user_reports:${tsuriId}`, 1, item);
      } else {
        await redis.lset(`auth:user_reports:${tsuriId}`, i, JSON.stringify(updatedReport));
      }
      break;
    }
  } catch (err) {
    console.error("[釣果同期] Redis 同期エラー:", err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const spotSlug = searchParams.get("spotSlug");
  if (!spotSlug) {
    return NextResponse.json({ error: "spotSlug が必要です" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { fishName, sizeCm, method, weather, comment } = body as {
    fishName?: string;
    sizeCm?: number | null;
    method?: string | null;
    weather?: string | null;
    comment?: string;
  };

  if (fishName !== undefined && (typeof fishName !== "string" || fishName.length === 0 || fishName.length > 30)) {
    return NextResponse.json({ error: "魚名を1〜30文字で入力してください" }, { status: 400 });
  }
  if (comment !== undefined && (typeof comment !== "string" || comment.length === 0 || comment.length > 100)) {
    return NextResponse.json({ error: "コメントを1〜100文字で入力してください" }, { status: 400 });
  }
  if (sizeCm !== undefined && sizeCm !== null && (typeof sizeCm !== "number" || sizeCm < 0 || sizeCm > 300)) {
    return NextResponse.json({ error: "サイズは0〜300cmで入力してください" }, { status: 400 });
  }
  if (method !== undefined && method !== null && (typeof method !== "string" || !ALLOWED_METHODS.includes(method))) {
    return NextResponse.json({ error: "釣法が不正です" }, { status: 400 });
  }
  if (weather !== undefined && weather !== null && (typeof weather !== "string" || !ALLOWED_WEATHER.includes(weather))) {
    return NextResponse.json({ error: "天候が不正です" }, { status: 400 });
  }

  if (fishName !== undefined || comment !== undefined) {
    const targets = [fishName, comment].filter((s): s is string => typeof s === "string");
    const mod = checkNgWords(targets);
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }
  }

  const existing = (await dbGet<CatchReport[]>(`SPOT#${spotSlug}`, "UGC_REPORTS")) ?? [];
  const idx = existing.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }
  if (existing[idx].tsuriId !== tsuriId) {
    return NextResponse.json({ error: "この釣果を編集する権限がありません" }, { status: 403 });
  }

  const updated: CatchReport = { ...existing[idx] };
  if (fishName !== undefined) updated.fishName = fishName;
  if (comment !== undefined) updated.comment = comment;
  if (sizeCm !== undefined) updated.sizeCm = sizeCm ?? undefined;
  if (method !== undefined) updated.method = method ?? undefined;
  if (weather !== undefined) updated.weather = weather ?? undefined;

  existing[idx] = updated;
  await dbPut(`SPOT#${spotSlug}`, "UGC_REPORTS", existing, TTL_SECONDS);
  await syncRedisItem(tsuriId, id, updated);

  return NextResponse.json({ ok: true, report: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const spotSlug = searchParams.get("spotSlug");
  if (!spotSlug) {
    return NextResponse.json({ error: "spotSlug が必要です" }, { status: 400 });
  }

  const existing = (await dbGet<CatchReport[]>(`SPOT#${spotSlug}`, "UGC_REPORTS")) ?? [];
  const target = existing.find((r) => r.id === id);
  if (!target) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }
  if (target.tsuriId !== tsuriId) {
    return NextResponse.json({ error: "この釣果を削除する権限がありません" }, { status: 403 });
  }

  const filtered = existing.filter((r) => r.id !== id);
  await dbPut(`SPOT#${spotSlug}`, "UGC_REPORTS", filtered, TTL_SECONDS);
  await syncRedisItem(tsuriId, id, null);

  return NextResponse.json({ ok: true });
}
