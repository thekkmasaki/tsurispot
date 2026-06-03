import { NextRequest, NextResponse } from "next/server";

/**
 * LINE 公式アカウント 全友だちへのブロードキャスト配信 API（リテンション 第2チャネル）
 *
 * 認可: ADMIN_RECONCILE_TOKEN を Authorization header に必須（push/send と同方式）
 * 認証: LINE_CHANNEL_ACCESS_TOKEN（既設定済み env、 line-webhook で利用中）を流用
 * 用途: Web Push と同一の「今週の釣果週報」を LINE 友だちにも配信
 *
 * ⚠️ コスト注意: LINE 無料プランは月 200 通まで（ブロードキャスト = 友だち数 × 1 通）。
 *   GitHub Actions 側は repo variable LINE_BROADCAST_ENABLED=true の時のみ本 API を叩く。
 */

export const runtime = "nodejs";
export const maxDuration = 30;

interface BroadcastPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

const SITE_BASE_URL = "https://tsurispot.com";

export async function POST(req: NextRequest) {
  // 認可: ADMIN_RECONCILE_TOKEN
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_RECONCILE_TOKEN;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelToken) {
    return NextResponse.json(
      { error: "LINE_CHANNEL_ACCESS_TOKEN not configured" },
      { status: 500 },
    );
  }

  let payload: BroadcastPayload;
  try {
    payload = (await req.json()) as BroadcastPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!payload.title || !payload.body) {
    return NextResponse.json(
      { error: "title and body required" },
      { status: 400 },
    );
  }

  // 相対パスは絶対 URL に変換（LINE には SW が無いため）
  const rawUrl = payload.url ?? "/";
  const fullUrl = rawUrl.startsWith("http")
    ? rawUrl
    : `${SITE_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  const text = `${payload.title}\n\n${payload.body}\n\n▼チェックする\n${fullUrl}`;

  const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelToken}`,
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[line/broadcast] LINE API error", res.status, detail);
    return NextResponse.json(
      { error: "line broadcast failed", status: res.status, detail },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
