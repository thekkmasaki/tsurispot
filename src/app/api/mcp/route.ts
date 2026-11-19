import { NextResponse } from "next/server";
import { handleBody, SERVER_INFO } from "@/lib/mcp/protocol";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * ツリスポ MCP サーバー（読み取り専用・認証なし）
 *   エンドポイント: https://tsurispot.com/api/mcp
 *   Claude: 設定 → コネクタ → カスタムコネクタを追加 に URL を入れる
 *   ChatGPT: 設定 → アプリとコネクタ（開発者モード）→ 作成 に URL を入れる
 *
 * Streamable HTTP のステートレス JSON 応答モード。GET（SSE ストリーム）は提供しない（405）。
 * 公開データのみを返すため認証は不要。濫用対策に IP 単位のレート制限をかける
 * （AI 事業者の送信元 IP は共有されるため上限は緩め）。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BODY_BYTES = 64 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const HEADERS = { ...CORS, "Cache-Control": "no-store" };

function rpcError(code: number, message: string, status: number) {
  return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code, message } }, { status, headers: HEADERS });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!(await checkRateLimit(ip, "mcp", 600, 600))) {
    return rpcError(-32000, "Rate limit exceeded", 429);
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return rpcError(-32600, "Request too large", 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return rpcError(-32700, "Parse error", 400);
  }

  // 接続トラブル調査・利用状況把握用（低頻度なので全件 1 行ログ）。個人情報は出さない
  const methods = (Array.isArray(body) ? body : [body])
    .map((m) => (m && typeof m === "object" ? String((m as { method?: unknown }).method ?? "-") : "?"))
    .join(",");
  const toolName = !Array.isArray(body) ? (body as { params?: { name?: unknown } })?.params?.name : undefined;
  console.log(
    `[mcp] POST ${methods}${toolName ? `:${String(toolName)}` : ""} ua=${(req.headers.get("user-agent") || "-").slice(0, 80)} auth=${req.headers.has("authorization")}`,
  );

  const result = await handleBody(body);
  if (result === null) return new NextResponse(null, { status: 202, headers: HEADERS });
  return NextResponse.json(result, { headers: HEADERS });
}

/** ブラウザで開いた人・疎通確認向けの説明（SSE ストリームは提供しない） */
export async function GET(req: Request) {
  console.log(`[mcp] GET accept=${(req.headers.get("accept") || "-").slice(0, 60)} ua=${(req.headers.get("user-agent") || "-").slice(0, 80)}`);
  if ((req.headers.get("accept") || "").includes("text/event-stream")) {
    return new NextResponse(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
  }
  return NextResponse.json(
    {
      ...SERVER_INFO,
      transport: "streamable-http",
      endpoint: "https://tsurispot.com/api/mcp",
      usage: "MCP クライアント（Claude のカスタムコネクタ / ChatGPT の開発者モード）にこの URL を登録してください。",
    },
    { headers: HEADERS },
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
