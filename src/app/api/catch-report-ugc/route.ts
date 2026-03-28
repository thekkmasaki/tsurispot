import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { checkNgWords } from "@/lib/moderation";

const GAS_WEBHOOK_URL = process.env.GAS_CATCH_REPORT_URL;

// Redis TTL: 365日
const TTL_SECONDS = 365 * 24 * 60 * 60;

// POST: ユーザー釣果投稿を受け取る
export async function POST(request: Request) {
  try {
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
    const reportData = {
      id: reportId,
      spotSlug,
      spotName: spotName || "",
      fishName,
      userName,
      comment,
      date,
      approved: true,
      photoUrl: photoUrl || undefined,
      sizeCm: sizeCm || undefined,
      method: method || undefined,
      weather: weather || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Redis に即時保存（自動承認）
    const redisKey = `ugc_reports:${spotSlug}`;
    try {
      await redis.lpush(redisKey, JSON.stringify(reportData));
      await redis.expire(redisKey, TTL_SECONDS);
    } catch (err) {
      console.error("[釣果投稿] Redis保存エラー:", err);
      // Redis障害時もGASに送信するため続行
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
