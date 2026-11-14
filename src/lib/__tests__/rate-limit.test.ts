import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/dynamodb", () => ({
  dbIncr: vi.fn(),
}));

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { dbIncr } from "@/lib/dynamodb";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("キーにウィンドウ番号を含め、TTLはウィンドウの2倍を渡す", async () => {
    vi.setSystemTime(new Date(1_000_000 * 1000)); // epoch 1,000,000秒
    vi.mocked(dbIncr).mockResolvedValue(1);

    await checkRateLimit("1.2.3.4", "CATCH_REPORT_UGC", 10, 600);

    const expectedWindow = Math.floor(1_000_000 / 600);
    expect(dbIncr).toHaveBeenCalledWith(
      `RATELIMIT#1.2.3.4#${expectedWindow}`,
      "CATCH_REPORT_UGC",
      1,
      1200,
    );
  });

  it("ウィンドウが変わるとキーが回転する（TTL削除遅延の影響を受けない）", async () => {
    vi.mocked(dbIncr).mockResolvedValue(1);

    vi.setSystemTime(new Date(1_000_000 * 1000));
    await checkRateLimit("1.2.3.4", "B", 10, 600);
    const firstKey = vi.mocked(dbIncr).mock.calls[0][0];

    vi.setSystemTime(new Date((1_000_000 + 600) * 1000)); // 1ウィンドウ後
    await checkRateLimit("1.2.3.4", "B", 10, 600);
    const secondKey = vi.mocked(dbIncr).mock.calls[1][0];

    expect(firstKey).not.toBe(secondKey);
  });

  it("上限以内なら true、超えたら false", async () => {
    vi.setSystemTime(new Date(1_000_000 * 1000));
    vi.mocked(dbIncr).mockResolvedValue(10);
    expect(await checkRateLimit("ip", "B", 10, 600)).toBe(true);

    vi.mocked(dbIncr).mockResolvedValue(11);
    expect(await checkRateLimit("ip", "B", 10, 600)).toBe(false);
  });

  it("DynamoDB障害時はフェイルオープン（true）", async () => {
    vi.setSystemTime(new Date(1_000_000 * 1000));
    vi.mocked(dbIncr).mockRejectedValue(new Error("boom"));
    expect(await checkRateLimit("ip", "B", 10, 600)).toBe(true);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });

  it("cf-connecting-ip を最優先", () => {
    expect(
      getClientIp(
        req({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2", "x-real-ip": "3.3.3.3" }),
      ),
    ).toBe("1.1.1.1");
  });

  it("x-forwarded-for は先頭のIPを使う", () => {
    expect(getClientIp(req({ "x-forwarded-for": "2.2.2.2, 10.0.0.1" }))).toBe("2.2.2.2");
  });

  it("x-real-ip にフォールバックする", () => {
    expect(getClientIp(req({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
  });

  it("ヘッダが無ければ unknown", () => {
    expect(getClientIp(req({}))).toBe("unknown");
  });
});

describe("getClientIp（ORIGIN_VERIFY_SECRET 設定時）", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });

  beforeEach(() => {
    vi.stubEnv("ORIGIN_VERIFY_SECRET", "s3cret");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("x-origin-verify が一致すれば cf-connecting-ip を信頼する", () => {
    expect(
      getClientIp(
        req({ "x-origin-verify": "s3cret", "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9, 2.2.2.2" }),
      ),
    ).toBe("1.1.1.1");
  });

  it("x-origin-verify が不一致なら偽装 cf-connecting-ip を無視し x-forwarded-for の右端を使う", () => {
    expect(
      getClientIp(
        req({ "x-origin-verify": "wrong", "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "6.6.6.6, 2.2.2.2" }),
      ),
    ).toBe("2.2.2.2");
  });

  it("x-origin-verify が無い場合も x-forwarded-for 先頭（偽装可能）は使わない", () => {
    expect(getClientIp(req({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "6.6.6.6,2.2.2.2" }))).toBe(
      "2.2.2.2",
    );
  });

  it("一致しても cf-connecting-ip が無ければ x-forwarded-for 右端 → x-real-ip → unknown", () => {
    expect(getClientIp(req({ "x-origin-verify": "s3cret", "x-forwarded-for": "2.2.2.2" }))).toBe("2.2.2.2");
    expect(getClientIp(req({ "x-origin-verify": "s3cret", "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(getClientIp(req({ "x-origin-verify": "s3cret" }))).toBe("unknown");
  });
});
