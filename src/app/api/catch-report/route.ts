import { NextResponse } from "next/server";
import { dbGet, dbIncr, dbPut } from "@/lib/dynamodb";

// GET: スポットの釣果報告数を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spotSlug = searchParams.get("spot");
    if (!spotSlug || spotSlug.length > 100) {
      return NextResponse.json({ error: "invalid spot" }, { status: 400 });
    }

    const count = (await dbGet<number>(`SPOT#${spotSlug}`, "CATCHCOUNT")) ?? 0;

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

// POST: 釣果報告を送信（1ユーザー1スポット1日1回まで）
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { spotSlug, sessionId } = body as { spotSlug?: string; sessionId?: string };

    if (!spotSlug || typeof spotSlug !== "string" || spotSlug.length > 100) {
      return NextResponse.json({ error: "invalid spotSlug" }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 60) {
      return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
    }

    // 連打防止: 1セッション1スポットにつき24時間に1回
    const alreadyReported = await dbGet(`SPOT#${spotSlug}`, `CATCHLIMIT#${sessionId}`);
    if (alreadyReported) {
      return NextResponse.json({ ok: false, error: "already_reported", count: (await dbGet<number>(`SPOT#${spotSlug}`, "CATCHCOUNT")) ?? 0 });
    }

    // カウントをインクリメント
    const newCount = await dbIncr(`SPOT#${spotSlug}`, "CATCHCOUNT");

    // レート制限キーを設定（24時間TTL）
    await dbPut(`SPOT#${spotSlug}`, `CATCHLIMIT#${sessionId}`, "1", 86400);

    return NextResponse.json({ ok: true, count: newCount });
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
