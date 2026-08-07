import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { checkNgWords } from "@/lib/moderation";
import { auth } from "@/lib/auth";
import { incrementReportCount } from "@/lib/user-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { savePostMeta, addToGlobalFeed, sanitizeTags, addTagsForPost } from "@/lib/social-store";

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
  tags?: string[];
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
    const { spotSlug, spotName, fishName, userName, comment, date, photoUrl, sizeCm, method, weather, tags } = body as {
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
      tags?: string[];
    };

    // バリデーション（スポットは任意: 未指定はタイムライン/マイページのみに載る「場所なし投稿」）
    if (spotSlug !== undefined && (typeof spotSlug !== "string" || spotSlug.length > 100)) {
      return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
    }
    const slug = typeof spotSlug === "string" ? spotSlug.trim() : "";
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

    // 未来の日付チェック（コンテナのTZはUTCのため、JSTの「今日」と文字列比較する。
    // UTC基準だとJST 0時〜9時に当日の投稿が「未来の日付」として弾かれてしまう）
    const todayJst = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
    if (date > todayJst) {
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

    // タグ（正規化・最大5個・各20字。不正入力は黙って除外）
    const normTags = sanitizeTags(tags);

    // NGワードチェック
    const modResult = checkNgWords([userName, fishName, comment, ...normTags]);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason }, { status: 400 });
    }

    const reportId = `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reportData: CatchReport = {
      id: reportId,
      spotSlug: slug,
      spotName: slug ? spotName || "" : "",
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
      tags: normTags.length > 0 ? normTags : undefined,
    };

    // 投稿の正本（POST#{id}/META）。パーマリンク・いいね・コメントの参照元
    try {
      await savePostMeta(reportData);
    } catch (err) {
      console.error("[釣果投稿] POST META保存エラー:", err);
      // 失敗してもスポット別ビューには載るため続行（パーマリンクのみ404になる縮退）
    }

    // 全体タイムライン（/timeline）への参照書き込み
    try {
      await addToGlobalFeed(reportData);
    } catch (err) {
      console.error("[釣果投稿] タイムライン書込エラー:", err);
    }

    // タグindex + 人気タグ（Redis zset）
    if (normTags.length > 0) {
      try {
        await addTagsForPost(reportData, normTags);
        await Promise.all(normTags.map((t) => redis.zincrby("tags:popular", 1, t)));
      } catch (err) {
        console.error("[釣果投稿] タグindex書込エラー:", err);
      }
    }

    // スポット別ビュー（場所なし投稿ではスキップ。パーマリンクとタイムラインにのみ載る）
    if (slug) {
      // DynamoDB に即時保存（自動承認）- read-modify-write
      try {
        const existing = await dbGet<CatchReport[]>(`SPOT#${slug}`, "UGC_REPORTS") ?? [];
        const updated = [reportData, ...existing].slice(0, 200); // 最大200件保持
        await dbPut(`SPOT#${slug}`, "UGC_REPORTS", updated, TTL_SECONDS);
        // オリジンISR＋Cloudflareエッジ(s-maxage=24h)の両方を該当スポットだけ無効化し、新しい釣果を即反映。
        // CF purge は特定URLのみ（全体purge禁止）・CF env未設定時は no-op。
        revalidatePath(`/spots/${slug}`);
        await purgeCloudflareUrls([`/spots/${slug}`]);
      } catch (err) {
        console.error("[釣果投稿] DynamoDB保存エラー:", err);
        // DynamoDB障害時もGASに送信するため続行
      }

      // 全スポット横断の最新釣果フィード（トップ「みんなの最近の釣果」用）。
      // 匿名・ログインを問わず push する（ログイン別の user_reports とは別系統）。
      // トップの導線はスポット詳細リンク前提のため、場所なし投稿は載せない。
      try {
        await redis.lpush("recent_reports:global", JSON.stringify(reportData));
        await redis.ltrim("recent_reports:global", 0, 49); // 最新50件保持
      } catch (err) {
        console.error("[釣果投稿] グローバル recent push エラー:", err);
      }
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
          spotUrl: slug ? `https://tsurispot.com/spots/${slug}` : "",
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
  } catch (e) {
    console.error("[釣果投稿] 処理エラー:", e);
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
