import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));
vi.mock("@/lib/user-status", () => ({ rejectInactiveUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/data/spots", () => ({ getSpotBySlug: vi.fn(() => undefined) }));
vi.mock("@/lib/s3", () => ({ ownS3KeyFromUrl: vi.fn(() => null) }));
vi.mock("@/lib/social-store", () => ({ getPostMeta: vi.fn() }));
vi.mock("@/lib/dynamodb", () => ({
  dbConditionalPut: vi.fn(),
  dbGet: vi.fn(),
  dbIncr: vi.fn(),
  dbPut: vi.fn(),
  dbQuery: vi.fn(),
}));

import { POST } from "../report-flag/route";
import { auth } from "@/lib/auth";
import { getPostMeta } from "@/lib/social-store";
import { dbConditionalPut, dbIncr, dbPut, dbQuery } from "@/lib/dynamodb";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/report-flag", { method: "POST", body: JSON.stringify(body) }));

describe("report-flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1" } } as never);
    vi.mocked(getPostMeta).mockResolvedValue({ id: "tw-1" } as never);
    vi.mocked(dbConditionalPut).mockResolvedValue(true);
    vi.mocked(dbIncr).mockResolvedValue(1);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("未ログインは 401 で何も記録しない", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await post({ reportId: "tw-1" });
    expect(res.status).toBe(401);
    expect(dbConditionalPut).not.toHaveBeenCalled();
  });

  it("不正な reportId は 400", async () => {
    expect((await post({ reportId: "../../etc" })).status).toBe(400);
    expect((await post({ reportId: "other-123" })).status).toBe(400);
  });

  it("実在しない投稿は 404 で記録も運営通知もしない", async () => {
    vi.mocked(getPostMeta).mockResolvedValue(null);
    const res = await post({ reportId: "tw-999" });
    expect(res.status).toBe(404);
    expect(dbConditionalPut).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("同一ユーザーの二重通報はカウントしない", async () => {
    vi.mocked(dbConditionalPut).mockResolvedValue(false);
    const res = await post({ reportId: "tw-1" });
    expect(res.status).toBe(200);
    expect(dbIncr).not.toHaveBeenCalled();
  });

  it("閾値(3)未満では自動非表示にしない／3件目で非表示にする", async () => {
    vi.mocked(dbIncr).mockResolvedValue(2);
    await post({ reportId: "tw-1" });
    expect(dbPut).not.toHaveBeenCalled();
    vi.mocked(dbIncr).mockResolvedValue(3);
    await post({ reportId: "tw-1" });
    expect(dbPut).toHaveBeenCalledWith("REPORT#tw-1", "FLAGGED", "1");
  });

  it("コメントは parentReportId 配下に存在する場合のみ通報できる", async () => {
    vi.mocked(dbQuery).mockResolvedValue([{ pk: "p", sk: "s", data: { id: "cmt-1" } }] as never);
    expect((await post({ reportId: "cmt-1", parentReportId: "tw-1" })).status).toBe(200);
    vi.mocked(dbQuery).mockResolvedValue([]);
    expect((await post({ reportId: "cmt-2", parentReportId: "tw-1" })).status).toBe(404);
    expect((await post({ reportId: "cmt-1" })).status).toBe(404);
  });
});
