import { describe, expect, it } from "vitest";
import { toPublicSpotPhotos } from "../spot-photo-public";

const users: Record<string, { nickname: string; isPublic?: boolean }> = {
  u1: { nickname: "アジ太郎" },
  u2: { nickname: "ひみつ", isPublic: false },
};
const lookup = async (id: string) => users[id] ?? null;

describe("toPublicSpotPhotos", () => {
  it("投稿者名を付け、最初の写真に first を付ける", async () => {
    const out = await toPublicSpotPhotos(
      [
        { url: "b", uploadedAt: 20, uploaderId: "u2" },
        { url: "a", uploadedAt: 10, uploaderId: "u1" },
        { url: "c", uploadedAt: 30, uploaderId: "gone" },
        { url: "d", uploadedAt: 40 },
      ],
      lookup,
    );
    expect(out[1]).toEqual({ url: "a", uploadedAt: 10, uploader: { name: "アジ太郎", tsuriId: "u1" }, first: true });
    // 非公開プロフィールは名前もリンクも出さない
    expect(out[0].uploader).toEqual({ name: "非公開の釣り人" });
    expect(out[0].first).toBeUndefined();
    // 見つからない・不明はクレジットなし
    expect(out[2].uploader).toBeUndefined();
    expect(out[3].uploader).toBeUndefined();
  });

  it("ユーザー取得に失敗してもクレジットなしで返す", async () => {
    const out = await toPublicSpotPhotos([{ url: "a", uploadedAt: 1, uploaderId: "x" }], async () => {
      throw new Error("db");
    });
    expect(out).toEqual([{ url: "a", uploadedAt: 1, first: true }]);
  });
});
