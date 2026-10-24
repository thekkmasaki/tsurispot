import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConditionalPut, dbGet, dbIncr, dbPut, dbQuery } from "@/lib/dynamodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getPostMeta, type PostComment } from "@/lib/social-store";
import { rejectInactiveUser } from "@/lib/user-status";
import { readJsonBody, resolveSpot } from "@/lib/ugc-validation";

// 自動非表示の閾値。通報者は【ログイン済みユニークユーザー】のみカウントする
// （匿名セッションIDは無限に作れるため、2件で他人の投稿を消せてしまっていた）。
const FLAG_THRESHOLD = 3;

const REPORT_ID_RE = /^(ugc|tw|cmt|contrib)-[0-9a-z-]{1,90}$/;

/**
 * 運営向けモデレーション通知（Discord・ベストエフォート）。
 * 失敗しても通報処理自体は成功させる。
 */
function notifyModeration(text: string): void {
  const url =
    process.env.DISCORD_MODERATION_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  // fire-and-forget（レスポンスをブロックしない。App Runnerの常駐Nodeで完了する）
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text, allowed_mentions: { parse: [] } }),
  }).catch(() => {
    /* 通知失敗は無視 */
  });
}

function hasId(list: unknown, id: string): boolean {
  if (!Array.isArray(list)) return false;
  return list.some((item) => {
    if (typeof item === "string") {
      try {
        return (JSON.parse(item) as { id?: string })?.id === id;
      } catch {
        return false;
      }
    }
    return (item as { id?: string } | null)?.id === id;
  });
}

/** 通報対象が実在するか。ID接頭辞ごとに正本を引いて確認する。 */
async function targetExists(
  reportId: string,
  parentReportId: unknown,
  spotSlug: unknown,
): Promise<boolean> {
  if (reportId.startsWith("tw-")) {
    return (await getPostMeta(reportId)) !== null;
  }
  if (reportId.startsWith("ugc-")) {
    if (await getPostMeta(reportId)) return true;
    // POST META を持たない旧投稿はスポット別ビューで確認
    const spot = resolveSpot(spotSlug);
    if (!spot) return false;
    return hasId(await dbGet(`SPOT#${spot.slug}`, "UGC_REPORTS"), reportId);
  }
  if (reportId.startsWith("contrib-")) {
    const spot = resolveSpot(spotSlug);
    if (!spot) return false;
    return hasId(await dbGet(`SPOT#${spot.slug}`, "SPOT_CONTRIB"), reportId);
  }
  if (reportId.startsWith("cmt-")) {
    if (typeof parentReportId !== "string" || !REPORT_ID_RE.test(parentReportId)) return false;
    const items = await dbQuery<PostComment>(`COMMENTS#${parentReportId}`, { skPrefix: "C#", all: true });
    return items.some((it) => it.data?.id === reportId);
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;
    if (!tsuriId) {
      return NextResponse.json(
        { error: "通報にはログインが必要です", message: "通報にはログインが必要です" },
        { status: 401 },
      );
    }
    const inactive = await rejectInactiveUser(tsuriId);
    if (inactive) return inactive;

    if (
      !(await checkRateLimit(tsuriId, "REPORT_FLAG_USER", 20, 3600)) ||
      !(await checkRateLimit(getClientIp(request), "REPORT_FLAG_IP", 60, 3600))
    ) {
      return NextResponse.json(
        { error: "通報が多すぎます。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }

    const body = await readJsonBody<{
      reportId?: unknown;
      parentReportId?: unknown;
      spotSlug?: unknown;
    }>(request, 4 * 1024);
    if (!body) {
      return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
    }
    const { reportId, parentReportId, spotSlug } = body;
    if (typeof reportId !== "string" || !REPORT_ID_RE.test(reportId)) {
      return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
    }

    // 実在しないIDへの通報は記録も運営通知もしない（DB汚染・Discordスパム防止）
    if (!(await targetExists(reportId, parentReportId, spotSlug))) {
      return NextResponse.json({ error: "通報対象が見つかりません" }, { status: 404 });
    }

    // 二重通報防止（ユーザー単位・条件付きPutで原子的に）
    const firstTime = await dbConditionalPut(
      `REPORT#${reportId}`,
      `USERFLAG#${tsuriId}`,
      "1",
      365 * 24 * 60 * 60,
    );
    if (!firstTime) {
      return NextResponse.json({ ok: true, message: "既に通報済みです" });
    }

    // 通報カウントをインクリメント
    const count = await dbIncr(`REPORT#${reportId}`, "FLAGCOUNT");

    // 閾値超え → 自動非表示
    const autoHidden = Boolean(count && count >= FLAG_THRESHOLD);
    if (autoHidden) {
      await dbPut(`REPORT#${reportId}`, "FLAGGED", "1");
    }

    // 早期対応のための運営通知（初回通報＝要確認 / 閾値超え＝自動非表示）
    if (autoHidden && count === FLAG_THRESHOLD) {
      notifyModeration(
        `🚫 投稿を自動非表示にしました（通報${count}件）: reportId=${reportId}`,
      );
    } else if (count === 1) {
      notifyModeration(
        `⚠️ 投稿に通報（要確認・1件目）: reportId=${reportId} — 問題があれば /api/admin/block-report で対応してください`,
      );
    }

    return NextResponse.json({
      ok: true,
      message: "通報を受け付けました。ご協力ありがとうございます。",
    });
  } catch {
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
