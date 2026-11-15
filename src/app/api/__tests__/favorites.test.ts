import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/redis", () => ({ redis: { set: vi.fn(), del: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  getClientIp: vi.fn().mockReturnValue("1.2.3.4"),
}));
vi.mock("@/lib/ugc-validation", () => ({
  readJsonBody: async (req: Request) => req.json(),
  resolveSpot: (slug: unknown) => (slug === "test-spot" ? { slug: "test-spot" } : null),
}));
vi.mock("@/lib/dynamodb", () => ({
  dbGet: vi.fn(),
  dbBatchGet: vi.fn(),
  dbIncr: vi.fn(),
  dbDecr: vi.fn(),
}));

import { NextRequest } from "next/server";
import { POST } from "../favorites/route";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { dbDecr, dbGet, dbIncr } from "@/lib/dynamodb";

const post = (action: string) =>
  POST(
    new NextRequest("http://localhost/api/favorites", {
      method: "POST",
      body: JSON.stringify({ slug: "test-spot", action }),
    }),
  );

describe("favorites（お気に入り数の水増し防止）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(dbIncr).mockResolvedValue(5);
    vi.mocked(dbDecr).mockResolvedValue(4);
    vi.mocked(dbGet).mockResolvedValue(4);
  });

  it("初回の +1 は数え、印を30日で付ける（匿名は IP のハッシュ）", async () => {
    vi.mocked(redis.set).mockResolvedValue("OK" as never);
    const res = await post("increment");
    expect((await res.json()).count).toBe(5);
    expect(dbIncr).toHaveBeenCalledTimes(1);
    const [key, , opts] = vi.mocked(redis.set).mock.calls[0];
    expect(key).toMatch(/^favmark:ip:[0-9a-f]{32}:test-spot$/);
    expect(String(key)).not.toContain("1.2.3.4");
    expect(opts).toEqual({ nx: true, ex: 30 * 24 * 60 * 60 });
  });

  it("同じ人の2回目の +1 は数えない", async () => {
    vi.mocked(redis.set).mockResolvedValue(null as never);
    const res = await post("increment");
    expect((await res.json()).count).toBe(4);
    expect(dbIncr).not.toHaveBeenCalled();
  });

  it("自分の +1 の印が無い -1 は数えない", async () => {
    vi.mocked(redis.del).mockResolvedValue(0 as never);
    await post("decrement");
    expect(dbDecr).not.toHaveBeenCalled();
  });

  it("印がある -1 は数え、0 のときは 0 のまま", async () => {
    vi.mocked(redis.del).mockResolvedValue(1 as never);
    expect((await (await post("decrement")).json()).count).toBe(4);
    vi.mocked(dbDecr).mockRejectedValue(new Error("ConditionalCheckFailed"));
    expect((await (await post("decrement")).json()).count).toBe(0);
  });

  it("ログイン中は tsuriId 単位で判定する", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { tsuriId: "u1" } } as never);
    vi.mocked(redis.set).mockResolvedValue("OK" as never);
    await post("increment");
    expect(vi.mocked(redis.set).mock.calls[0][0]).toBe("favmark:u:u1:test-spot");
  });
});
