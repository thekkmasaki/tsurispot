import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { handleBody, handleMessage } from "../protocol";
import { searchSpots, getSpotDetails, getTide, getCatchableFish, resolveFishSlugs, isMonthInRange } from "../tools";
import { fishingSpots } from "@/lib/data/spots";
import { POST, GET } from "@/app/api/mcp/route";

type Ok = { result: Record<string, unknown> };
const call = (name: string, args: Record<string, unknown>) =>
  (handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) as Ok).result;

const seaSpot = fishingSpots.find(
  (s) => ["port", "breakwater"].includes(s.spotType) && s.region.prefecture === "神奈川県" && !s.fishingBan,
)!;

describe("MCP protocol", () => {
  it("initialize: 対応バージョンはそのまま返し、未知のバージョンは既定に落とす", () => {
    const r1 = handleMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } }) as Ok;
    expect(r1.result.protocolVersion).toBe("2025-03-26");
    expect(r1.result.capabilities).toEqual({ tools: { listChanged: false } });
    const r2 = handleMessage({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "1999-01-01" } }) as Ok;
    expect(r2.result.protocolVersion).toBe("2025-06-18");
  });

  it("通知（id なし）には応答しない", () => {
    expect(handleMessage({ jsonrpc: "2.0", method: "notifications/initialized" })).toBeNull();
  });

  it("tools/list は4ツールを読み取り専用として返し、内部関数は漏らさない", () => {
    const r = handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" }) as Ok;
    const tools = r.result.tools as Record<string, unknown>[];
    expect(tools.map((t) => t.name)).toEqual(["search_spots", "get_spot_details", "get_tide", "get_catchable_fish"]);
    for (const t of tools) {
      expect(t).not.toHaveProperty("run");
      expect((t.annotations as Record<string, unknown>).readOnlyHint).toBe(true);
      expect(JSON.stringify(t)).toBeTruthy();
    }
  });

  it("未知のメソッド・不正リクエスト", () => {
    expect(handleMessage({ jsonrpc: "2.0", id: 1, method: "resources/list" })).toMatchObject({ error: { code: -32601 } });
    expect(handleMessage({ foo: 1 })).toMatchObject({ error: { code: -32600 } });
    expect(handleBody([])).toMatchObject({ error: { code: -32600 } });
  });

  it("入力ミスは isError のツール結果で返す（AI が直して再試行できる）", () => {
    const r = call("get_spot_details", { slug: "no-such-spot-xyz" });
    expect(r.isError).toBe(true);
    expect(call("search_spots", {}).isError).toBe(true);
    expect(call("get_tide", { slug: seaSpot.slug, date: "明日" }).isError).toBe(true);
  });
});

describe("tools", () => {
  it("isMonthInRange は年またぎ（11月〜3月）を扱える", () => {
    expect(isMonthInRange(1, 11, 3)).toBe(true);
    expect(isMonthInRange(6, 11, 3)).toBe(false);
    expect(isMonthInRange(6, 4, 9)).toBe(true);
  });

  it("魚名はかな・別名でも解決できる", () => {
    expect(resolveFishSlugs("あおりいか").size).toBeGreaterThan(0);
    expect(resolveFishSlugs("存在しない魚ほげ").size).toBe(0);
  });

  it("search_spots: 県×魚×月で絞り込み、URL に utm が付く", () => {
    const r = searchSpots({ prefecture: "神奈川", fish: "アジ", month: 7, limit: 5 });
    expect(r.spots.length).toBeGreaterThan(0);
    for (const s of r.spots) {
      expect(s.prefecture).toBe("神奈川県");
      expect(s.url).toMatch(/^https:\/\/tsurispot\.com\/spots\/.+\?utm_source=ai_mcp/);
    }
  });

  it("search_spots: 「京都」で東京都が混ざらない", () => {
    const r = searchSpots({ prefecture: "京都", limit: 20 });
    expect(r.spots.every((s) => s.prefecture === "京都府")).toBe(true);
  });

  it("search_spots: 全面釣り禁止スポットは推薦しない", () => {
    const banned = fishingSpots.find((s) => s.fishingBan?.scope === "full");
    if (!banned) return;
    const r = searchSpots({ query: banned.name, limit: 20 });
    expect(r.spots.some((s) => s.slug === banned.slug)).toBe(false);
  });

  it("get_spot_details: URL 形式の slug も受け付ける", () => {
    const r = getSpotDetails({ slug: `https://tsurispot.com/spots/${seaSpot.slug}?x=1` });
    expect(r.name).toBe(seaSpot.name);
    expect(r.catchableFish.length).toBeGreaterThan(0);
  });

  it("get_tide: 海のスポットは気象庁データの満干潮を返す", () => {
    const r = getTide({ slug: seaSpot.slug, date: "2026-12-01" }) as Record<string, unknown>;
    expect(r.tideType).toBeTruthy();
    expect(Array.isArray(r.highTides)).toBe(true);
    expect((r.highTides as unknown[]).length).toBeGreaterThan(0);
  });

  it("get_tide: 湖・池は潮汐なし", () => {
    const lake = fishingSpots.find((s) => s.spotType === "lake")!;
    const r = getTide({ slug: lake.slug, date: "2026-12-01" }) as Record<string, unknown>;
    expect(r.highTides).toBeUndefined();
    expect(r.note).toMatch(/淡水/);
  });

  it("get_catchable_fish: 県単位の集計", () => {
    const r = getCatchableFish({ prefecture: "千葉県", month: 11 }) as { fish: unknown[]; spotsAnalyzed: number };
    expect(r.spotsAnalyzed).toBeGreaterThan(10);
    expect(r.fish.length).toBeGreaterThan(3);
  });
});

describe("route /api/mcp", () => {
  const post = (body: unknown) =>
    POST(new Request("https://tsurispot.com/api/mcp", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

  it("tools/call が JSON で返る", async () => {
    const res = await post({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "search_spots", arguments: { prefecture: "千葉", limit: 2 } } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(7);
    expect(json.result.structuredContent.spots).toHaveLength(2);
  });

  it("通知は 202、壊れた JSON は 400", async () => {
    expect((await post({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    expect((await post("{broken")).status).toBe(400);
  });

  it("GET の SSE 要求は 405", async () => {
    const res = await GET(new Request("https://tsurispot.com/api/mcp", { headers: { accept: "text/event-stream" } }));
    expect(res.status).toBe(405);
  });
});
