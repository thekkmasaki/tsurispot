import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPost, MAX_SLIDES, HASHTAG_MAX } from "../../scripts/sns/manual-carousel/load.mjs";

/**
 * 単発カルーセル（scripts/sns/manual-carousel/posts/）は置いた画像とキャプションをそのまま Instagram に出す。
 * 枚数・連番・JPEG・キャプション長・ハッシュタグ数は投稿時に API で弾かれるので、置いた時点で落とす。
 */
const POSTS = path.join(process.cwd(), "scripts/sns/manual-carousel/posts");
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);

function makePost(files: Record<string, Buffer | string>): { dir: string; name: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "manual-carousel-"));
  const name = "sample";
  fs.mkdirSync(path.join(dir, name));
  for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name, f), body);
  return { dir, name };
}

describe("単発カルーセルの投稿フォルダ", () => {
  it("リポジトリに置いた投稿はすべて制約を満たす", () => {
    const names = fs.readdirSync(POSTS).filter((n) => fs.statSync(path.join(POSTS, n)).isDirectory());
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const post = loadPost(POSTS, name) as { slides: string[]; caption: string };
      expect(post.slides.length, name).toBeLessThanOrEqual(MAX_SLIDES);
      expect(post.caption, name).toContain("ツリスポ");
    }
  });

  it("画像が1枚だけなら弾く", () => {
    const { dir, name } = makePost({ "slide-01.jpg": JPEG, "caption-instagram.txt": "本文" });
    expect(() => loadPost(dir, name)).toThrow(/2〜10枚/);
  });

  it("11枚は弾く（Graph API のカルーセル上限は10枚）", () => {
    const files: Record<string, Buffer | string> = { "caption-instagram.txt": "本文" };
    for (let i = 1; i <= 11; i++) files[`slide-${String(i).padStart(2, "0")}.jpg`] = JPEG;
    const { dir, name } = makePost(files);
    expect(() => loadPost(dir, name)).toThrow(/2〜10枚/);
  });

  it("番号が飛んでいたら弾く", () => {
    const { dir, name } = makePost({ "slide-01.jpg": JPEG, "slide-03.jpg": JPEG, "caption-instagram.txt": "本文" });
    expect(() => loadPost(dir, name)).toThrow(/連番/);
  });

  it("中身が JPEG でない画像は弾く", () => {
    const { dir, name } = makePost({ "slide-01.jpg": JPEG, "slide-02.jpg": Buffer.from("PNG"), "caption-instagram.txt": "本文" });
    expect(() => loadPost(dir, name)).toThrow(/JPEG/);
  });

  it("キャプションが無い・空・長すぎる・タグが多すぎるものは弾く", () => {
    const two = { "slide-01.jpg": JPEG, "slide-02.jpg": JPEG };
    expect(() => loadPost(...Object.values(makePost(two)) as [string, string])).toThrow(/caption-instagram\.txt/);
    expect(() => loadPost(...Object.values(makePost({ ...two, "caption-instagram.txt": "  \n" })) as [string, string])).toThrow(/空/);
    expect(() => loadPost(...Object.values(makePost({ ...two, "caption-instagram.txt": "あ".repeat(2201) })) as [string, string])).toThrow(/2200字/);
    const tags = Array.from({ length: HASHTAG_MAX + 1 }, (_, i) => `#tag${i}`).join(" ");
    expect(() => loadPost(...Object.values(makePost({ ...two, "caption-instagram.txt": tags })) as [string, string])).toThrow(/ハッシュタグ/);
  });

  it("投稿名にパス区切りを含められない", () => {
    expect(() => loadPost(POSTS, "../weekly-carousel")).toThrow(/投稿名/);
  });
});
