import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { checkNgWords } from "@/lib/moderation";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { savePostMeta, addToGlobalFeed, type PostMeta } from "@/lib/social-store";

const GAS_WEBHOOK_URL = process.env.GAS_CATCH_REPORT_URL;
const MAX_TEXT_LENGTH = 200;

// POST: つぶやき投稿（Twitter型・本文のみ必須）。
// 釣果UGC(catch-report-ugc)と違い【ログイン必須】。自由文はスパム面が広いため匿名不可。
// 保存先は投稿正本(POST#)＋タイムラインの月別フィード＋本人のuser_reports（プロフィール表示用）のみ。
// スポット別ビュー・トップ「みんなの最近の釣果」・釣果数カウントには載せない
// （魚種の裏取りがない自由文で釣果系の面を汚さない。fishName無しは既存の図鑑/記録集計で自然に除外される）
export async function POST(request: Request) {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;
    // なりすまし防止のため表示名はセッションのニックネームを正とする
    const userName = (session?.user?.nickname ?? "").trim();

    if (!tsuriId) {
      return NextResponse.json({ error: "投稿にはログインが必要です" }, { status: 401 });
    }
    if (!userName || userName.length > 20) {
      return NextResponse.json(
        { error: "ニックネームを設定してから投稿してください" },
        { status: 400 },
      );
    }

    // レート制限: 1IP 10分間に 10 投稿まで（釣果UGCと同水準）
    if (!(await checkRateLimit(getClientIp(request), "TWEET", 10, 600))) {
      return NextResponse.json(
        { error: "投稿が多すぎます。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { text, photoUrl, spotSlug, spotName, fishName, sizeCm } = body as {
      text?: string;
      photoUrl?: string;
      spotSlug?: string;
      spotName?: string;
      fishName?: string;
      sizeCm?: number;
    };

    // バリデーション（本文のみ必須。場所・写真・釣果情報は任意添付）
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `本文を入力してください（${MAX_TEXT_LENGTH}文字以内）` },
        { status: 400 },
      );
    }
    if (photoUrl !== undefined && (typeof photoUrl !== "string" || !/^https?:\/\//.test(photoUrl))) {
      return NextResponse.json({ error: "写真URLが不正です" }, { status: 400 });
    }
    if (spotSlug !== undefined && (typeof spotSlug !== "string" || spotSlug.length > 100)) {
      return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
    }
    if (fishName !== undefined && (typeof fishName !== "string" || fishName.length > 30)) {
      return NextResponse.json({ error: "魚名は30文字以内で入力してください" }, { status: 400 });
    }
    if (sizeCm !== undefined && (typeof sizeCm !== "number" || sizeCm < 0 || sizeCm > 300)) {
      return NextResponse.json({ error: "サイズは0〜300cmの範囲で入力してください" }, { status: 400 });
    }

    // NGワードチェック
    const modResult = checkNgWords([userName, trimmed, fishName || ""]);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason }, { status: 400 });
    }

    // 投稿日は JST の今日（つぶやきは日付指定なし）
    const todayJst = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

    const postId = `tw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const post: PostMeta = {
      id: postId,
      type: "tweet",
      spotSlug: (spotSlug || "").trim(),
      spotName: spotSlug ? spotName || "" : "",
      fishName: fishName || "",
      userName,
      tsuriId,
      comment: trimmed,
      date: todayJst,
      photoUrl: photoUrl || undefined,
      sizeCm: sizeCm || undefined,
      submittedAt: new Date().toISOString(),
    };

    // 投稿の正本（POST#{id}/META）。パーマリンク・いいね・コメント・リポストの参照元
    await savePostMeta(post);

    // 全体タイムライン（/timeline）への参照書き込み
    try {
      await addToGlobalFeed(post);
    } catch (err) {
      console.error("[つぶやき投稿] タイムライン書込エラー:", err);
    }

    // プロフィールの投稿一覧ソース（fishName無しは図鑑・自己記録・県マップ集計で自然に除外される）
    try {
      await redis.lpush(`auth:user_reports:${tsuriId}`, JSON.stringify(post));
      await redis.ltrim(`auth:user_reports:${tsuriId}`, 0, 999);
    } catch (err) {
      console.error("[つぶやき投稿] Redis LIST push エラー:", err);
    }

    // Google Apps Script Webhook（記録・モデレーション用、fire-and-forget）
    if (GAS_WEBHOOK_URL) {
      fetch(GAS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          spotUrl: post.spotSlug ? `https://tsurispot.com/spots/${post.spotSlug}` : "",
        }),
        redirect: "follow",
      }).catch((err) => {
        console.error("[つぶやき投稿] GAS送信エラー:", err);
      });
    }

    return NextResponse.json({ ok: true, id: postId, message: "投稿しました！" });
  } catch (e) {
    console.error("[つぶやき投稿] 処理エラー:", e);
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
