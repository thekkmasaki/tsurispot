import { NextResponse } from "next/server";

// POST: ユーザー釣果投稿を受け取る
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { spotSlug, spotName, fishName, userName, comment, date } = body as {
      spotSlug?: string;
      spotName?: string;
      fishName?: string;
      userName?: string;
      comment?: string;
      date?: string;
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

    // ログ出力（実運用ではDB保存やメール通知に置き換え）
    console.log("[釣果投稿]", {
      spotSlug,
      spotName,
      fishName,
      userName,
      comment,
      date,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: "投稿ありがとうございます！管理者の承認後に表示されます。",
    });
  } catch {
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
