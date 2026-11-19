// MCP（Model Context Protocol）の最小実装 — Streamable HTTP のステートレス JSON 応答モード
//
// SDK を入れずに自前実装している理由: 読み取り専用ツールだけで、必要なメソッドは
// initialize / ping / tools/list / tools/call の4つ。依存追加（zod 等）とバンドル増を避け、
// 挙動をテストで完全に固定できる方を選んだ。セッション・SSE・サーバー発リクエストは使わない。
//
// 仕様: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
import { TOOLS, ToolError } from "./tools";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const LATEST = "2025-06-18";

export const SERVER_INFO = {
  name: "tsurispot",
  title: "ツリスポ（釣り場・潮汐・釣れる魚）",
  version: "1.0.0",
  websiteUrl: "https://tsurispot.com",
};

const INSTRUCTIONS =
  "ツリスポは日本全国約4,000か所の釣り場情報サイトです。釣り場の提案には search_spots（現在地からなら find_nearby_spots）、" +
  "詳細は get_spot_details、潮は get_tide、天気と釣行指数は get_fishing_forecast、時期の魚は get_catchable_fish、" +
  "最近の釣果は get_recent_catches、釣具店は find_tackle_shops、魚の情報は get_fish_info、仕掛け・道具は recommend_gear、" +
  "釣り禁止やルールは check_fishing_rules を使ってください。" +
  "ユーザーが釣果を投稿・記録したいときは draft_catch_report で下書きを作り、返された confirmUrl を開いて写真を付けて確定するよう案内してください（ツールだけでは投稿は完了しません）。" +
  "回答ではスポット名に url（ツリスポのページ）を添え、釣り禁止情報がある場合は必ず伝えてください。";

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

export type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: JsonRpcId; result: unknown }
  | { jsonrpc: "2.0"; id: JsonRpcId; error: { code: number; message: string } };

const err = (id: JsonRpcId, code: number, message: string): JsonRpcResponse => ({
  jsonrpc: "2.0",
  id,
  error: { code, message },
});

function isRequest(v: unknown): v is JsonRpcRequest {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as JsonRpcRequest).jsonrpc === "2.0" &&
    typeof (v as JsonRpcRequest).method === "string"
  );
}

/** 1メッセージを処理する。通知（id なし）には null を返す（HTTP 202）。 */
export async function handleMessage(msg: unknown): Promise<JsonRpcResponse | null> {
  if (!isRequest(msg)) {
    // レスポンス（クライアント→サーバーの result/error）は使わないので受け流す
    if (typeof msg === "object" && msg !== null && "jsonrpc" in msg && !("method" in msg)) return null;
    return err(null, -32600, "Invalid Request");
  }
  const id = msg.id;
  if (id === undefined) return null; // notifications/initialized 等

  switch (msg.method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      const protocolVersion =
        typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions: INSTRUCTIONS,
        },
      };
    }
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS.map(({ run: _run, ...def }) => def),
        },
      };
    case "tools/call": {
      const name = msg.params?.name;
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) return err(id, -32602, `Unknown tool: ${String(name)}`);
      const rawArgs = msg.params?.arguments;
      const args = typeof rawArgs === "object" && rawArgs !== null ? (rawArgs as Record<string, unknown>) : {};
      try {
        const data = (await tool.run(args)) as Record<string, unknown>;
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(data) }],
            structuredContent: data,
            isError: false,
          },
        };
      } catch (e) {
        // 入力ミス・外部サービス障害はツールエラーとして返し、AI が引数を直す／再試行できるようにする
        const message = e instanceof ToolError ? e.message : "内部エラーが発生しました";
        if (!(e instanceof ToolError)) console.error("[mcp] tool error", name, e);
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: message }], isError: true },
        };
      }
    }
    default:
      return err(id, -32601, `Method not found: ${msg.method}`);
  }
}

/** ボディ（単体 or バッチ配列）を処理。返すべき応答がなければ null。 */
export async function handleBody(body: unknown): Promise<JsonRpcResponse | JsonRpcResponse[] | null> {
  if (Array.isArray(body)) {
    if (body.length === 0) return err(null, -32600, "Invalid Request");
    const out = (await Promise.all(body.slice(0, 20).map(handleMessage))).filter(
      (r): r is JsonRpcResponse => r !== null,
    );
    return out.length > 0 ? out : null;
  }
  return handleMessage(body);
}
