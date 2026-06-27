import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { checkNgWords } from "@/lib/moderation";
import { auth } from "@/lib/auth";
import { incrementReportCount } from "@/lib/user-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GAS_WEBHOOK_URL = process.env.GAS_CATCH_REPORT_URL;

// TTL: 365日
const TTL_SECONDS = 365 * 24 * 60 * 60;

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

// POST: ユーザー釣果投稿を受け取る
export async function POST(request: Request) {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;

    // レート制限（匿名自動公開のため、スパム/荒らしによるトップ表示汚染を防ぐ）: 1IP 10分間に 10 投稿まで
    if (!(await checkRateLimit(getClientIp(request), "CATCH_REPORT_UGC", 10, 600))) {
      return NextResponse.json(
        { error: "投稿が多すぎます。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { spotSlug, spotName, fishName, userName, comment, date, photoUrl, sizeCm, method, weather } = body as {
      spotSlug?: string;
      spotName?: string;
      fishName?: string;
      userName?: string;
      comment?: string;
      date?: string;
      photoUrl?: string;
      sizeCm?: number;
      method?: string;
      weather?: string;
    };

    // バリデーション
    if (!spotSlug || typeof spotSlug !== "string" || spotSlug.length > 100) {
      return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
    }
    if (!fishName || typeof fishName !== "string" || fishName.length > 30) {
      return NextResponse.json({ error: "魚名を入力してください（30文字以内）" }, { status: 400 });
    }
    if (!userName || typeof userName !== "string" || userName.length > 20) {
      return NextResponse.json({ error: "ニックネームを入力してください（20文字以内）" }, { status: 400 });
    }
    if (!comment || typeof comment !== "string" || comment.length > 100) {
      return NextResponse.json({ error: "コメントを入力してください（100文字以内）" }, { status: 400 });
    }
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "日付の形式が不正です" }, { status: 400 });
    }

    // 未来の日付チェック
    const reportDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (reportDate > today) {
      return NextResponse.json({ error: "未来の日付は指定できません" }, { status: 400 });
    }

    // オプショナルフィールドのバリデーション
    if (photoUrl !== undefined && (typeof photoUrl !== "string" || !/^https?:\/\//.test(photoUrl))) {
      return NextResponse.json({ error: "写真URLが不正です" }, { status: 400 });
    }
    if (sizeCm !== undefined && (typeof sizeCm !== "number" || sizeCm < 0 || sizeCm > 300)) {
      return NextResponse.json({ error: "サイズは0〜300cmの範囲で入力してください" }, { status: 400 });
    }
    const ALLOWED_METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"];
    if (method !== undefined && (typeof method !== "string" || !ALLOWED_METHODS.includes(method))) {
      return NextResponse.json({ error: "釣法が不正です" }, { status: 400 });
    }
    const ALLOWED_WEATHER = ["晴れ", "曇り", "雨", "風強い"];
    if (weather !== undefined && (typeof weather !== "string" || !ALLOWED_WEATHER.includes(weather))) {
      return NextResponse.json({ error: "天候が不正です" }, { status: 400 });
    }

    // NGワードチェック
    const modResult = checkNgWords([userName, fishName, comment]);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason }, { status: 400 });
    }

    const reportId = `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reportData: CatchReport = {
      id: reportId,
      spotSlug,
      spotName: spotName || "",
      fishName,
      userName,
      tsuriId,
      comment,
      date,
      approved: true,
      photoUrl: photoUrl || undefined,
      sizeCm: sizeCm || undefined,
      method: method || undefined,
      weather: weather || undefined,
      submittedAt: new Date().toISOString(),
    };

    // DynamoDB に即時保存（自動承認）- read-modify-write
    try {
      const existing = await dbGet<CatchReport[]>(`SPOT#${spotSlug}`, "UGC_REPORTS") ?? [];
      const updated = [reportData, ...existing].slice(0, 200); // 最大200件保持
      await dbPut(`SPOT#${spotSlug}`, "UGC_REPORTS", updated, TTL_SECONDS);
      // ISR ページを即時無効化し、新しい釣果を即反映（spot revalidate=86400 の遅延を回避）
      revalidatePath(`/spots/${spotSlug}`);
    } catch (err) {
      console.error("[釣果投稿] DynamoDB保存エラー:", err);
      // DynamoDB障害時もGASに送信するため続行
    }

    // 全スポット横断の最新釣果フィード（トップ「みんなの最近の釣果」用）。
    // 匿名・ログインを問わず push する（ログイン別の user_reports とは別系統）。
    try {
      await redis.lpush("recent_reports:global", JSON.stringify(reportData));
      await redis.ltrim("recent_reports:global", 0, 49); // 最新50件保持
    } catch (err) {
      console.error("[釣果投稿] グローバル recent push エラー:", err);
    }

    // ログインユーザーの釣果数カウントを更新（バッジ・称号反映）
    if (tsuriId) {
      try {
        await incrementReportCount(tsuriId);
      } catch (err) {
        console.error("[釣果投稿] reportCount更新エラー:", err);
      }
      // Redis LIST に追加 (マイページ・統計・図鑑・ストリーク等の集計ソース)
      try {
        await redis.lpush(
          `auth:user_reports:${tsuriId}`,
          JSON.stringify(reportData),
        );
        await redis.ltrim(`auth:user_reports:${tsuriId}`, 0, 999);
      } catch (err) {
        console.error("[釣果投稿] Redis LIST push エラー:", err);
      }
    }

    // Google Apps Script Webhook に送信（記録・通知用、fire-and-forget）
    if (GAS_WEBHOOK_URL) {
      fetch(GAS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          spotUrl: `https://tsurispot.com/spots/${spotSlug}`,
        }),
        redirect: "follow",
      }).catch((err) => {
        console.error("[釣果投稿] GAS送信エラー:", err);
      });
    }

    return NextResponse.json({
      ok: true,
      message: "釣果が投稿されました！",
    });
  } catch {
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
