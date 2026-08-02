import { NextResponse } from "next/server";
import { dbExists, dbPut, dbIncr } from "@/lib/dynamodb";

// 自動公開方針(approved:true)下では通報が唯一の事後防御のため、閾値を低め(2)に設定し
// 迅速に自動非表示にする。加えて初回通報で運営に即通知し人手で確認できるようにする。
const FLAG_THRESHOLD = 2;

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
    body: JSON.stringify({ content: text }),
  }).catch(() => {
    /* 通知失敗は無視 */
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { reportId, sessionId } = body as {
      reportId?: string;
      sessionId?: string;
    };

    if (!reportId || typeof reportId !== "string" || reportId.length > 100) {
      return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 100) {
      return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
    }

    // 二重通報防止
    const alreadyFlagged = await dbExists(`REPORT#${reportId}`, `USERFLAG#${sessionId}`);
    if (alreadyFlagged) {
      return NextResponse.json({ ok: true, message: "既に通報済みです" });
    }

    // 通報記録
    await dbPut(`REPORT#${reportId}`, `USERFLAG#${sessionId}`, "1", 365 * 24 * 60 * 60);

    // 通報カウントをインクリメント
    const count = await dbIncr(`REPORT#${reportId}`, "FLAGCOUNT");

    // 閾値超え → 自動非表示
    const autoHidden = Boolean(count && count >= FLAG_THRESHOLD);
    if (autoHidden) {
      await dbPut(`REPORT#${reportId}`, "FLAGGED", "1");
    }

    // 早期対応のための運営通知（初回通報＝要確認 / 閾値超え＝自動非表示）
    if (autoHidden) {
      notifyModeration(
        `🚫 釣果投稿を自動非表示にしました（通報${count}件）: reportId=${reportId}`,
      );
    } else if (count === 1) {
      notifyModeration(
        `⚠️ 釣果投稿に通報（要確認・1件目）: reportId=${reportId} — 問題があれば /api/admin/block-report で対応してください`,
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
