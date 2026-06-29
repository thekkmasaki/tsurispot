import { describe, it, expect, vi, afterEach } from "vitest";
import { purgeCloudflareUrls } from "../cloudflare";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.CF_API_TOKEN;
  delete process.env.CF_ZONE_ID;
});

describe("purgeCloudflareUrls", () => {
  it("CF env 未設定なら fetch せず no-op（段階導入の安全側）", async () => {
    delete process.env.CF_API_TOKEN;
    delete process.env.CF_ZONE_ID;
    const f = vi.spyOn(global, "fetch");
    await purgeCloudflareUrls(["/spots/x"]);
    expect(f).not.toHaveBeenCalled();
  });

  it("空配列なら no-op", async () => {
    process.env.CF_API_TOKEN = "t";
    process.env.CF_ZONE_ID = "z";
    const f = vi.spyOn(global, "fetch");
    await purgeCloudflareUrls([]);
    expect(f).not.toHaveBeenCalled();
  });

  it("env 設定時は purge_cache に特定URLのみ POST（全体purageしない）", async () => {
    process.env.CF_API_TOKEN = "t";
    process.env.CF_ZONE_ID = "z";
    const f = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    await purgeCloudflareUrls(["/spots/abc"]);
    expect(f).toHaveBeenCalledOnce();
    const call = f.mock.calls[0];
    expect(String(call[0])).toContain("/zones/z/purge_cache");
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ files: ["https://tsurispot.com/spots/abc"] });
    // purge_everything は絶対に使わない（2026-06-23 障害対策）
    expect(body.purge_everything).toBeUndefined();
  });

  it("失敗(例外)を握りつぶし投稿を妨げない", async () => {
    process.env.CF_API_TOKEN = "t";
    process.env.CF_ZONE_ID = "z";
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network"));
    await expect(purgeCloudflareUrls(["/spots/abc"])).resolves.toBeUndefined();
  });
});
