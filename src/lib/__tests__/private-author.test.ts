import { describe, it, expect, vi } from "vitest";
import { maskPrivateAuthors, PRIVATE_AUTHOR_NAME } from "@/lib/private-author";

const users: Record<string, { isPublic?: boolean }> = {
  pub: { isPublic: true },
  priv: { isPublic: false },
  legacy: {},
};

describe("maskPrivateAuthors", () => {
  it("非公開の人だけ名前を伏せて tsuriId を外し、釣果の中身は残す", async () => {
    const lookup = vi.fn(async (id: string) => users[id] ?? null);
    const out = await maskPrivateAuthors(
      [
        { id: "1", userName: "公開さん", tsuriId: "pub", fishName: "アジ" },
        { id: "2", userName: "秘密さん", tsuriId: "priv", fishName: "サバ" },
        { id: "3", userName: "秘密さん", tsuriId: "priv", fishName: "イカ" },
        { id: "4", userName: "匿名さん", fishName: "メバル" },
        { id: "5", userName: "旧会員", tsuriId: "legacy", fishName: "ハゼ" },
      ],
      lookup,
    );
    expect(out[0]).toEqual({ id: "1", userName: "公開さん", tsuriId: "pub", fishName: "アジ" });
    expect(out[1]).toEqual({ id: "2", userName: PRIVATE_AUTHOR_NAME, fishName: "サバ" });
    expect(out[2].tsuriId).toBeUndefined();
    expect(out[3].userName).toBe("匿名さん");
    expect(out[4].tsuriId).toBe("legacy");
    // 同じ人は1回だけ引く
    expect(lookup).toHaveBeenCalledTimes(3);
  });

  it("本人が見ているときは伏せない", async () => {
    const out = await maskPrivateAuthors(
      [{ userName: "秘密さん", tsuriId: "priv" }],
      async (id) => users[id] ?? null,
      "priv",
    );
    expect(out[0].userName).toBe("秘密さん");
  });

  it("ユーザー情報を引けないときは伏せる（fail-closed）", async () => {
    const out = await maskPrivateAuthors([{ userName: "誰か", tsuriId: "x" }], async () => {
      throw new Error("redis down");
    });
    expect(out[0].userName).toBe(PRIVATE_AUTHOR_NAME);
  });
});
