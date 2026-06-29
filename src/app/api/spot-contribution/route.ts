import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { checkNgWords } from "@/lib/moderation";
import { auth } from "@/lib/auth";
import { incrementContributionCount } from "@/lib/user-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { SpotContribution } from "@/lib/data/spot-contributions";

// TTL: 365日（釣果UGCと同じ）
const TTL_SECONDS = 365 * 24 * 60 * 60;
const MAX_PER_SPOT = 200;

// POST: スポット情報の共同編集UGC（釣り場メモ/コツ）を受け取る。
// 釣果UGC(catch-report-ugc)と同じ自動公開+事後モデレーション方式。
// ただし荒らし抑制のため【ログイン必須】（匿名不可）。canonicalデータは上書きしない（追記型）。
export async function POST(request: Request) {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;
    // 表示名はクライアント送信値でなく【セッションのニックネーム】を正とする（なりすまし防止）
    const userName = (session?.user?.nickname ?? "").trim();

    // ログイン必須
    if (!tsuriId) {
      return NextResponse.json(
        { error: "投稿にはログインが必要です" },
        { status: 401 },
      );
    }

    // レート制限: 1IP 10分間に 10 投稿まで
    if (!(await checkRateLimit(getClientIp(request), "SPOT_CONTRIB", 10, 600))) {
      return NextResponse.json(
        { error: "投稿が多すぎます。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { spotSlug, type, text } = body as {
      spotSlug?: string;
      type?: string;
      text?: string;
    };

    // バリデーション
    if (!spotSlug || typeof spotSlug !== "string" || spotSlug.length > 100) {
      return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
    }
    // MVPは "tip"（釣り場メモ/コツ）のみ。将来 "fish" 等を許可
    if (type !== "tip") {
      return NextResponse.json({ error: "投稿タイプが不正です" }, { status: 400 });
    }
    if (!userName || userName.length > 20) {
      return NextResponse.json({ error: "ニックネームを設定してから投稿してください" }, { status: 400 });
    }
    // 釣り場メモは最低限の長さを要求（薄いUGCでSEO品質を下げないため）
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (trimmed.length < 8 || trimmed.length > 200) {
      return NextResponse.json(
        { error: "釣り場メモは8〜200文字で入力してください" },
        { status: 400 },
      );
    }

    // NGワード・スパム・URL/連絡先チェック
    const modResult = checkNgWords([userName, trimmed]);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason }, { status: 400 });
    }

    const id = `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const contribution: SpotContribution = {
      id,
      spotSlug,
      type: "tip",
      text: trimmed,
      userName,
      tsuriId,
      date: now.toISOString().slice(0, 10),
      approved: true,
      submittedAt: now.toISOString(),
    };

    // DynamoDB に即時保存（自動承認）- read-modify-write
    try {
      const existing = (await dbGet<SpotContribution[]>(`SPOT#${spotSlug}`, "SPOT_CONTRIB")) ?? [];
      // 同一ユーザーの同一スポットへの連投を1日1件に抑制（水増し防止）
      const todayStr = contribution.date;
      const dup = existing.find(
        (c) => c.tsuriId === tsuriId && c.date === todayStr,
      );
      if (dup) {
        return NextResponse.json(
          { error: "このスポットへの投稿は1日1件までです" },
          { status: 429 },
        );
      }
      const updated = [contribution, ...existing].slice(0, MAX_PER_SPOT);
      await dbPut(`SPOT#${spotSlug}`, "SPOT_CONTRIB", updated, TTL_SECONDS);
      // オリジンISR＋Cloudflareエッジ(s-maxage=24h)の両方を該当スポットだけ無効化し、新しい投稿を即反映。
      revalidatePath(`/spots/${spotSlug}`);
      await purgeCloudflareUrls([`/spots/${spotSlug}`]);
    } catch (err) {
      console.error("[spot-contribution] DynamoDB保存エラー:", err);
      return NextResponse.json(
        { error: "投稿の保存に失敗しました。時間をおいてお試しください。" },
        { status: 500 },
      );
    }

    // 編集者バッジ・貢献ランクの集計元。新しい貢献数を即時報酬フィードバックに返す。
    let contributionCount = 0;
    try {
      contributionCount = await incrementContributionCount(tsuriId);
    } catch (err) {
      console.error("[spot-contribution] contributionCount更新エラー:", err);
    }

    return NextResponse.json({
      ok: true,
      message: "釣り場情報を投稿しました！ありがとうございます🎣",
      contributionCount,
    });
  } catch {
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
