import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { getRequestUser, unauthorizedResponse } from "@/lib/app-link/request-user";
import { checkNgWords } from "@/lib/moderation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { decrementReportCount } from "@/lib/user-store";
import { savePostMeta, deletePostMeta, getPostMeta } from "@/lib/social-store";
import { rejectInactiveUser } from "@/lib/user-status";
import { deleteFromS3, ownS3KeyFromUrl } from "@/lib/s3";
import { SPOT_SLUG_RE } from "@/lib/ugc-validation";
import {
  DELETE_KEY_HEADER,
  DELETE_KEY_RE,
  getDeleteKeyRecord,
  removeDeleteKey,
  verifyDeleteKey,
} from "@/lib/ugc-delete-key";

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

async function syncRedisList(
  listKey: string,
  id: string,
  updatedReport: CatchReport | null,
): Promise<void> {
  try {
    const reports = await redis.lrange<string>(listKey, 0, -1);
    for (let i = 0; i < reports.length; i++) {
      const item = reports[i];
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed?.id !== id) continue;
      if (updatedReport === null) {
        await redis.lrem(listKey, 1, item);
      } else {
        await redis.lset(listKey, i, JSON.stringify(updatedReport));
      }
      break;
    }
  } catch (err) {
    console.error("[釣果同期] Redis 同期エラー:", err);
  }
}

// マイページ用リストと、トップ「みんなの最近の釣果」(recent_reports:global) の両方に編集/削除を反映する
async function syncRedisItem(
  tsuriId: string,
  id: string,
  updatedReport: CatchReport | null,
): Promise<void> {
  await syncRedisList(`auth:user_reports:${tsuriId}`, id, updatedReport);
  await syncRedisList("recent_reports:global", id, updatedReport);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ru = await getRequestUser(request);
  if (ru.kind === "unauthorized") return unauthorizedResponse();
  const tsuriId = ru.kind === "user" ? ru.user.tsuriId : undefined;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const inactive = await rejectInactiveUser(tsuriId);
  if (inactive) return inactive;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const spotSlug = searchParams.get("spotSlug");
  if (!spotSlug || !SPOT_SLUG_RE.test(spotSlug)) {
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
  // ひとことは投稿時と同様に任意（空文字で「コメントなし」に更新できる）
  if (comment !== undefined && (typeof comment !== "string" || comment.length > 100)) {
    return NextResponse.json({ error: "コメントは100文字以内で入力してください" }, { status: 400 });
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
  try {
    await savePostMeta(updated);
  } catch (err) {
    console.error("[釣果編集] POST META更新エラー:", err);
  }

  return NextResponse.json({ ok: true, report: updated });
}

const UGC_ID_RE = /^ugc-[0-9a-z-]{1,90}$/;

/**
 * ログインしない投稿を削除キー（ヘッダ X-Delete-Key）で消す。
 * ログイン済みの投稿（tsuriId あり）は対象外。後片付けはアカウント投稿の削除
 * （スポット別一覧・最近の釣果・投稿正本）に合わせ、加えてスポットページのキャッシュを無効化する。
 */
async function deleteWithKey(request: NextRequest, id: string, key: string): Promise<NextResponse> {
  if (!(await checkRateLimit(getClientIp(request), "CATCH_REPORT_UGC_DELKEY", 20, 600))) {
    return NextResponse.json(
      { error: "操作が多すぎます。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }
  if (!UGC_ID_RE.test(id) || !DELETE_KEY_RE.test(key)) {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  const rec = await getDeleteKeyRecord(id);
  if (!rec) {
    return NextResponse.json({ error: "釣果が見つかりません" }, { status: 404 });
  }
  if (!verifyDeleteKey(key, rec.hash)) {
    return NextResponse.json({ error: "この釣果を削除する権限がありません" }, { status: 403 });
  }

  const meta = await getPostMeta(id).catch(() => null);
  if (meta?.tsuriId) {
    // 念のため: アカウントに紐づく投稿は削除キーでは消さない（アカウントの削除を使う）
    return NextResponse.json({ error: "この釣果を削除する権限がありません" }, { status: 403 });
  }

  const spotSlug = typeof rec.spotSlug === "string" && SPOT_SLUG_RE.test(rec.spotSlug) ? rec.spotSlug : "";
  let photoUrl = meta?.photoUrl;
  if (spotSlug) {
    const existing = (await dbGet<CatchReport[]>(`SPOT#${spotSlug}`, "UGC_REPORTS")) ?? [];
    const target = existing.find((r) => r.id === id);
    if (target?.tsuriId) {
      return NextResponse.json({ error: "この釣果を削除する権限がありません" }, { status: 403 });
    }
    if (target) {
      photoUrl = photoUrl ?? target.photoUrl;
      await dbPut(
        `SPOT#${spotSlug}`,
        "UGC_REPORTS",
        existing.filter((r) => r.id !== id),
        TTL_SECONDS,
      );
    }
  }
  await syncRedisList("recent_reports:global", id, null);
  try {
    await deletePostMeta(id);
  } catch (err) {
    console.error("[釣果削除(キー)] POST META削除エラー:", err);
  }
  try {
    await removeDeleteKey(id);
  } catch (err) {
    console.error("[釣果削除(キー)] 削除キー削除エラー:", err);
  }
  // 投稿者がアカウントを持たないため、写真を消す手段はここしかない。自前バケットの写真だけ消す。
  if (photoUrl && ownS3KeyFromUrl(photoUrl)) {
    try {
      await deleteFromS3(photoUrl);
    } catch (err) {
      console.error("[釣果削除(キー)] 写真削除エラー:", err);
    }
  }
  if (spotSlug) {
    // スポットページは ISR(7日)＋Cloudflare エッジのため、投稿時と同じく該当ページだけ無効化する
    try {
      revalidatePath(`/spots/${spotSlug}`);
      await purgeCloudflareUrls([`/spots/${spotSlug}`]);
    } catch (err) {
      console.error("[釣果削除(キー)] キャッシュ無効化エラー:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 削除キー付きはログイン不要の別経路（ログイン無しの投稿に限る）。Authorization は見ない。
  const deleteKey = request.headers.get(DELETE_KEY_HEADER);
  if (deleteKey !== null) {
    const { id } = await params;
    return deleteWithKey(request, id, deleteKey.trim());
  }

  const ru = await getRequestUser(request);
  if (ru.kind === "unauthorized") return unauthorizedResponse();
  const tsuriId = ru.kind === "user" ? ru.user.tsuriId : undefined;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const inactive = await rejectInactiveUser(tsuriId);
  if (inactive) return inactive;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const spotSlug = searchParams.get("spotSlug");
  if (!spotSlug || !SPOT_SLUG_RE.test(spotSlug)) {
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
  try {
    await deletePostMeta(id);
  } catch (err) {
    console.error("[釣果削除] POST META削除エラー:", err);
  }
  try {
    await decrementReportCount(tsuriId);
  } catch (err) {
    console.error("[釣果削除] reportCount デクリメントエラー:", err);
  }

  return NextResponse.json({ ok: true });
}
