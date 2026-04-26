import { NextResponse } from "next/server";
import { dbExists, dbPut, dbIncr } from "@/lib/dynamodb";

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
    if (count && count >= FLAG_THRESHOLD) {
      await dbPut(`REPORT#${reportId}`, "FLAGGED", "1");
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
