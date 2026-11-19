import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/dynamodb", () => ({ dbIncr: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: vi.fn().mockReturnValue("203.0.113.7") }));

import { dbIncr } from "@/lib/dynamodb";
import { isAiClient, checkMcpRateLimit, maskIp, MCP_LIMITS } from "../rate-limit";
import { POST } from "@/app/api/mcp/route";

const UA_CLAUDE = "Claude-User (claude-code/1.0; +https://support.anthropic.com/)";
const UA_OPENAI = "openai-mcp/1.0.0";

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.mocked(dbIncr).mockReset();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("isAiClient", () => {
  it("既知の AI クライアントの UA だけを AI 枠にする", () => {
    expect(isAiClient(UA_CLAUDE)).toBe(true);
    expect(isAiClient(UA_OPENAI)).toBe(true);
    expect(isAiClient("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0")).toBe(true);
    // 汎用ライブラリ・ブラウザ・UAなしは通常枠
    expect(isAiClient("python-httpx/0.27.0")).toBe(false);
    expect(isAiClient("curl/8.4.0")).toBe(false);
    expect(isAiClient("Mozilla/5.0 (Macintosh)")).toBe(false);
    expect(isAiClient(null)).toBe(false);
  });
});

describe("checkMcpRateLimit", () => {
  it("AI クライアントは bucket mcp-ai・上限3000、それ以外は mcp・上限300（どちらも IP キー・10分窓）", async () => {
    vi.mocked(dbIncr).mockResolvedValue(3000);
    expect(await checkMcpRateLimit("1.2.3.4", UA_CLAUDE)).toBe(true);
    expect(vi.mocked(dbIncr).mock.calls[0]).toEqual([expect.stringMatching(/^RATELIMIT#1\.2\.3\.4#\d+$/), "mcp-ai", 1, 1200]);
    vi.mocked(dbIncr).mockResolvedValue(3001);
    expect(await checkMcpRateLimit("1.2.3.4", UA_CLAUDE)).toBe(false);

    vi.mocked(dbIncr).mockResolvedValue(300);
    expect(await checkMcpRateLimit("1.2.3.4", "curl/8")).toBe(true);
    expect(vi.mocked(dbIncr).mock.calls.at(-1)?.[1]).toBe("mcp");
    vi.mocked(dbIncr).mockResolvedValue(301);
    expect(await checkMcpRateLimit("1.2.3.4", "curl/8")).toBe(false);
    expect(MCP_LIMITS).toEqual({ ai: { bucket: "mcp-ai", limit: 3000 }, default: { bucket: "mcp", limit: 300 } });
  });

  it("上限の半分を超えた時点で rate-high を1回だけ warn する", async () => {
    for (const c of [149, 150, 151, 152, 200]) {
      vi.mocked(dbIncr).mockResolvedValueOnce(c);
      await checkMcpRateLimit("1.2.3.4", "curl/8");
    }
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/^\[mcp\] rate-high bucket=mcp ip=1\.2\.x\.x count=151\/300/);
  });

  it("バッチで半分を一気に跨いでも1回だけ warn する", async () => {
    vi.mocked(dbIncr).mockResolvedValueOnce(1495);
    await checkMcpRateLimit("1.2.3.4", UA_CLAUDE, 10);
    vi.mocked(dbIncr).mockResolvedValueOnce(1510);
    await checkMcpRateLimit("1.2.3.4", UA_CLAUDE, 15);
    vi.mocked(dbIncr).mockResolvedValueOnce(1525);
    await checkMcpRateLimit("1.2.3.4", UA_CLAUDE, 15);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("DynamoDB 障害時は通す（フェイルオープン）", async () => {
    vi.mocked(dbIncr).mockRejectedValueOnce(new Error("ddb down"));
    expect(await checkMcpRateLimit("1.2.3.4", "curl/8")).toBe(true);
  });

  it("ログの IP は後半を伏せる", () => {
    expect(maskIp("203.0.113.7")).toBe("203.0.x.x");
    expect(maskIp("2001:db8:85a3:0:0:8a2e:370:7334")).toBe("2001:db8:85a3::x");
  });
});

describe("route /api/mcp のレート制限", () => {
  const post = (body: unknown, ua?: string) =>
    POST(
      new Request("https://tsurispot.com/api/mcp", {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: ua ? { "user-agent": ua } : {},
      }),
    );

  it("上限超過は 429 の JSON-RPC エラー", async () => {
    vi.mocked(dbIncr).mockResolvedValueOnce(301);
    const res = await post({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ jsonrpc: "2.0", id: null, error: { code: -32000, message: "Rate limit exceeded" } });
  });

  it("同じ件数でも AI クライアントなら通る", async () => {
    vi.mocked(dbIncr).mockResolvedValueOnce(301);
    const res = await post({ jsonrpc: "2.0", id: 1, method: "tools/list" }, UA_CLAUDE);
    expect(res.status).toBe(200);
  });

  it("バッチは件数分（最大20）を数える。壊れた JSON も1回として数える", async () => {
    vi.mocked(dbIncr).mockResolvedValue(1);
    await post(Array.from({ length: 3 }, (_, i) => ({ jsonrpc: "2.0", id: i, method: "ping" })));
    expect(vi.mocked(dbIncr).mock.calls.at(-1)?.[2]).toBe(3);
    await post(Array.from({ length: 50 }, (_, i) => ({ jsonrpc: "2.0", id: i, method: "ping" })));
    expect(vi.mocked(dbIncr).mock.calls.at(-1)?.[2]).toBe(20);
    const res = await post("{broken");
    expect(res.status).toBe(400);
    expect(vi.mocked(dbIncr).mock.calls.at(-1)?.[2]).toBe(1);
  });
});
