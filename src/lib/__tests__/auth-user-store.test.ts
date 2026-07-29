import { describe, it, expect, vi, beforeEach } from "vitest";

// Upstash Redis をモック（createUser / getUserByProvider が使う get/set のみ）
vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

import { createUser, type TsuriSpotUser } from "@/lib/auth-redis";
import { redis } from "@/lib/redis";

const loser: TsuriSpotUser = {
  id: "loser-uuid",
  nickname: "釣り人loser",
  provider: "cognito",
  providerId: "Google_123",
  createdAt: "2026-07-29T00:00:00.000Z",
};

const winner: TsuriSpotUser = {
  id: "winner-uuid",
  nickname: "釣り人winner",
  provider: "cognito",
  providerId: "Google_123",
  createdAt: "2026-07-29T00:00:00.000Z",
};

describe("createUser の SETNX 競合セマンティクス", () => {
  beforeEach(() => vi.clearAllMocks());

  // SETNX 契約: provider mapping キーに対し {nx:true} で id を書く。この呼び出し形が
  // 原子性の本体なので、全ケースで引数ごとアサートする（戻り値駆動だけだと nx 外しや
  // キー破壊の退行を検出できない）。
  const SETNX_ARGS = [
    "auth:provider:cognito:Google_123",
    "loser-uuid",
    { nx: true },
  ] as const;

  it("SETNX 取得成功時は本体を書き込み引数の user を返す", async () => {
    vi.mocked(redis.set).mockResolvedValue("OK");
    const result = await createUser(loser);
    expect(result).toEqual(loser);
    expect(redis.set).toHaveBeenNthCalledWith(1, ...SETNX_ARGS);
    expect(redis.set).toHaveBeenCalledWith("auth:user:loser-uuid", loser);
  });

  it("SETNX 敗北時は勝者のレコードを返す（敗者の id で JWT を発行させない）", async () => {
    // nx 敗北 → null
    vi.mocked(redis.set).mockResolvedValue(null);
    // getUserByProvider: mapping → winner-uuid, 本体 → winner
    vi.mocked(redis.get)
      .mockResolvedValueOnce("winner-uuid")
      .mockResolvedValueOnce(winner);
    const result = await createUser(loser);
    expect(result).toEqual(winner);
    // SETNX のみ呼ばれ、敗者の本体レコードは書き込まれない
    expect(redis.set).toHaveBeenNthCalledWith(1, ...SETNX_ARGS);
    expect(redis.set).toHaveBeenCalledTimes(1);
    expect(redis.get).toHaveBeenNthCalledWith(
      1,
      "auth:provider:cognito:Google_123",
    );
    expect(redis.get).toHaveBeenNthCalledWith(2, "auth:user:winner-uuid");
  });

  it("SETNX 敗北かつ本体欠損時は mapping の userId で自己修復する", async () => {
    vi.mocked(redis.set).mockResolvedValue(null);
    vi.mocked(redis.get)
      // getUserByProvider: mapping はあるが本体が無い
      .mockResolvedValueOnce("orphan-uuid")
      .mockResolvedValueOnce(null)
      // 自己修復のための mapping 再取得
      .mockResolvedValueOnce("orphan-uuid");
    const result = await createUser(loser);
    expect(result.id).toBe("orphan-uuid");
    expect(redis.set).toHaveBeenNthCalledWith(1, ...SETNX_ARGS);
    expect(redis.get).toHaveBeenNthCalledWith(
      3,
      "auth:provider:cognito:Google_123",
    );
    expect(redis.set).toHaveBeenLastCalledWith("auth:user:orphan-uuid", {
      ...loser,
      id: "orphan-uuid",
    });
  });
});
