// /api/mcp 専用のレート制限
//
// Claude / ChatGPT 経由の通信は AI 事業者の少数の IP から来るため、IP ごとの上限が低いと
// 人気が出たときに利用者全員がまとめて止まる。一方で認証なしの公開 API なので、データの丸ごと取得も抑えたい。
//  - UA が既知の AI クライアント → bucket "mcp-ai"（10分 3000回）
//  - それ以外（スクリプト・ブラウザ・不明） → bucket "mcp"（10分 300回）
// キーは共通の checkRateLimit と同じ固定ウィンドウ方式（RATELIMIT#{ip}#{window} / bucket）。
// 件数が要るので dbIncr を直接使う。上限の半分を超えた瞬間に1回だけ warn を出す（監視用）。
// DynamoDB 障害時は通す（フェイルオープン。既存の checkRateLimit と同じ方針）。
//
// python-httpx は Anthropic の最初の疎通確認でも使われるが、汎用ライブラリでスクレイピングにも
// 使われるため AI 枠には入れない（疎通確認は数回なので通常枠 300回で十分足りる）。
// UA は偽装できるので、AI 枠も IP 単位のまま上限を設けている。
import { dbIncr } from "@/lib/dynamodb";

export const AI_CLIENT_UA = [/Claude-User/i, /claude-ai/i, /openai-mcp/i, /ChatGPT-User/i];

export const MCP_LIMITS = {
  ai: { bucket: "mcp-ai", limit: 3000 },
  default: { bucket: "mcp", limit: 300 },
} as const;

export const MCP_WINDOW_SECONDS = 600;

export function isAiClient(userAgent: string | null | undefined): boolean {
  return !!userAgent && AI_CLIENT_UA.some((re) => re.test(userAgent));
}

/** ログ用に IP の後半を伏せる（送信元の事業者は分かるが個人は特定しない） */
export function maskIp(ip: string): string {
  if (ip.includes(".")) return ip.split(".").slice(0, 2).join(".") + ".x.x";
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::x";
  return ip;
}

/**
 * 1リクエスト分を数えて、上限内なら true。
 * @param units このリクエストで処理するメッセージ数（バッチは件数分数える。最低1）
 */
export async function checkMcpRateLimit(ip: string, userAgent: string | null, units = 1): Promise<boolean> {
  const { bucket, limit } = isAiClient(userAgent) ? MCP_LIMITS.ai : MCP_LIMITS.default;
  const amount = Math.max(1, Math.floor(units));
  try {
    const window = Math.floor(Date.now() / 1000 / MCP_WINDOW_SECONDS);
    const count = await dbIncr(`RATELIMIT#${ip}#${window}`, bucket, amount, MCP_WINDOW_SECONDS * 2);
    const half = Math.floor(limit / 2);
    // 半分を跨いだ1回だけ出す（バッチで一気に跨いでも1回）
    if (count > half && count - amount <= half) {
      console.warn(
        `[mcp] rate-high bucket=${bucket} ip=${maskIp(ip)} count=${count}/${limit} window=${MCP_WINDOW_SECONDS}s ua=${(userAgent || "-").slice(0, 60)}`,
      );
    }
    return count <= limit;
  } catch {
    return true;
  }
}
