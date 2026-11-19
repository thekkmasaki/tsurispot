import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));

import { handleMessage } from "../protocol";
import { draftCatchReport, ToolError, ToolInputError } from "../tools";
import { buildDraftQuery, parseDraftQuery } from "../catch-draft";
import { fishingSpots } from "@/lib/data/spots";
import { todayJst } from "@/lib/ugc-validation";

type Ok = { result: Record<string, unknown> };

const spot = fishingSpots.find((s) => ["port", "breakwater"].includes(s.spotType) && !s.fishingBan)!;
const banned = fishingSpots.find((s) => s.fishingBan?.scope === "full");

describe("draft_catch_report", () => {
  it("tools/list に載り、読み取り専用（何も保存しない）として公開される", async () => {
    const r = (await handleMessage({ jsonrpc: "2.0", id: 1, method: "tools/list" })) as Ok;
    const tool = (r.result.tools as Record<string, unknown>[]).find((t) => t.name === "draft_catch_report")!;
    expect(tool).toBeTruthy();
    expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    expect((tool.inputSchema as { required: string[] }).required).toEqual(["slug", "fishName"]);
  });

  it("確認ページの URL を返し、まだ投稿されていないことを明示する", () => {
    const r = draftCatchReport({
      slug: spot.slug,
      fishName: "アジ",
      sizeCm: 22,
      method: "サビキ",
      weather: "晴れ",
      date: "2026-11-01",
      comment: "入れ食いだった！",
    });
    expect(r.status).toBe("draft_not_posted");
    expect(r.nextStep).toMatch(/まだ投稿されていません/);
    const url = new URL(r.confirmUrl);
    expect(url.origin + url.pathname).toBe("https://tsurispot.com/post/catch");
    expect(url.searchParams.get("utm_source")).toBe("ai_mcp");
    expect(url.searchParams.get("spot")).toBe(spot.slug);
    expect(url.searchParams.get("fish")).toBe("アジ");
    expect(url.searchParams.get("size")).toBe("22");
    expect(url.searchParams.get("method")).toBe("サビキ");
    expect(url.searchParams.get("comment")).toBe("入れ食いだった！");
  });

  it("日付を省略すると今日（日本時間）になる", () => {
    const r = draftCatchReport({ slug: spot.slug, fishName: "サバ" });
    expect(r.draft.date).toBe(todayJst());
  });

  it("入力ミスは ToolInputError（AI が直して再試行できる）", () => {
    expect(() => draftCatchReport({ slug: spot.slug })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: "no-such-spot-xyz", fishName: "アジ" })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", method: "釣り堀" })).toThrow(/サビキ/);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", weather: "快晴" })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", sizeCm: 500 })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", date: "2999-01-01" })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", date: "明日" })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "あ".repeat(31) })).toThrow(ToolInputError);
    expect(() => draftCatchReport({ slug: spot.slug, fishName: "アジ", comment: "あ".repeat(101) })).toThrow(ToolInputError);
  });

  it("全面釣り禁止の釣り場には下書きを作らない", () => {
    if (!banned) return;
    expect(() => draftCatchReport({ slug: banned.slug, fishName: "アジ" })).toThrow(ToolError);
  });

  it("tools/call 経由の入力ミスは isError の結果になる", async () => {
    const r = (await handleMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "draft_catch_report", arguments: { slug: spot.slug } },
    })) as Ok;
    expect(r.result.isError).toBe(true);
  });
});

describe("下書きクエリ（確認ページ /post/catch）", () => {
  it("build → parse で元に戻る", () => {
    const d = { spot: spot.slug, fishName: "アジ、サバ", sizeCm: 22.5, method: "サビキ" as const, weather: "曇り" as const, date: "2026-11-01", comment: "ぽつぽつ釣れた" };
    expect(parseDraftQuery(Object.fromEntries(new URLSearchParams(buildDraftQuery(d))))).toEqual(d);
  });

  it("書き換えられた不正な項目は捨てる（spot が無ければ null）", () => {
    expect(parseDraftQuery({ fish: "アジ" })).toBeNull();
    const d = parseDraftQuery({
      spot: spot.slug,
      fish: "あ".repeat(31),
      size: "-3",
      method: "ダイナマイト",
      weather: "<script>",
      date: "2999-01-01",
      comment: "あ".repeat(101),
    })!;
    expect(d).toEqual({
      spot: spot.slug,
      fishName: undefined,
      sizeCm: undefined,
      method: undefined,
      weather: undefined,
      date: undefined,
      comment: undefined,
    });
  });

  it("同じキーが複数あっても先頭だけ使う", () => {
    expect(parseDraftQuery({ spot: [spot.slug, "x"], fish: ["アジ", "サバ"] })?.fishName).toBe("アジ");
  });
});
