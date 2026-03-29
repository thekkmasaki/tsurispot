import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

const FLAG_THRESHOLD = 3;

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

    // 認証ユーザーの場合はuserIdで重複チェック、未認証はsessionId
    const session = await auth();
    const identifier = session?.user?.tsuriId || sessionId;

    if (!identifier || typeof identifier !== "string" || identifier.length > 100) {
      return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
    }

    // 二重通報防止
    const userFlagKey = `report_user_flag:${identifier}:${reportId}`;
    const alreadyFlagged = await redis.exists(userFlagKey);
    if (alreadyFlagged) {
      return NextResponse.json({ ok: true, message: "既に通報済みです" });
    }

    // 通報記録
    await redis.set(userFlagKey, "1", { ex: 365 * 24 * 60 * 60 });

    // 通報カウントをインクリメント
    const flagKey = `report_flags:${reportId}`;
    const count = await redis.incr(flagKey);

    // 閾値超え → 自動非表示
    if (count && count >= FLAG_THRESHOLD) {
      await redis.set(`report_flagged:${reportId}`, "1");
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
