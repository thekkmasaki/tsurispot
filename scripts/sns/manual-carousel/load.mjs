/** 単発カルーセルの投稿フォルダを読み、Instagram の制約に合っているか確かめる */
import fs from "fs";
import path from "path";

export const MIN_SLIDES = 2;
export const MAX_SLIDES = 10; // Instagram Graph API のカルーセル上限
export const CAPTION_MAX = 2200;
export const HASHTAG_MAX = 5; // Instagram が 2025-12 に1投稿5個へ制限

const isJpeg = (file) => {
  const b = fs.readFileSync(file);
  return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
};

/**
 * @param {string} postsDir posts フォルダ
 * @param {string} name 投稿名（フォルダ名。英数字とハイフンのみ）
 * @returns {{ slides: string[], caption: string }}
 */
export function loadPost(postsDir, name) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`投稿名は英小文字・数字・ハイフンのみ: ${name}`);
  const dir = path.join(postsDir, name);
  if (!fs.existsSync(dir)) throw new Error(`投稿フォルダがありません: posts/${name}`);
  const slides = fs.readdirSync(dir).filter((f) => /^slide-\d{2}\.jpg$/.test(f)).sort().map((f) => path.join(dir, f));
  if (slides.length < MIN_SLIDES || slides.length > MAX_SLIDES) throw new Error(`画像は${MIN_SLIDES}〜${MAX_SLIDES}枚（posts/${name} は${slides.length}枚）`);
  const numbers = slides.map((f) => Number(path.basename(f).slice(6, 8)));
  if (numbers.some((n, i) => n !== i + 1)) throw new Error(`slide-01.jpg から連番にしてください（posts/${name}）`);
  for (const f of slides) if (!isJpeg(f)) throw new Error(`JPEG ではありません: ${path.basename(f)}`);
  const captionPath = path.join(dir, "caption-instagram.txt");
  if (!fs.existsSync(captionPath)) throw new Error(`caption-instagram.txt がありません（posts/${name}）`);
  const caption = fs.readFileSync(captionPath, "utf8").trim();
  if (!caption) throw new Error(`キャプションが空です（posts/${name}）`);
  if ([...caption].length > CAPTION_MAX) throw new Error(`キャプションが${CAPTION_MAX}字を超えています（${[...caption].length}字）`);
  const tags = caption.match(/#[^\s#]+/g) ?? [];
  if (tags.length > HASHTAG_MAX) throw new Error(`ハッシュタグは${HASHTAG_MAX}個まで（${tags.length}個）`);
  return { slides, caption };
}
