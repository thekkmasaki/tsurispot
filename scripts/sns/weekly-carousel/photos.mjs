/**
 * 週報の魚名 → 魚の実写写真を引く。
 * 優先: ①オーナーの実釣写真（owner-photos.json → 非公開S3） ②図鑑の実釣写真（userPhotos）
 *       ③図鑑の写真（imageUrl のうち LICENSES.md に出典があり、イラスト(SVG)でないもの）
 * 写真が見つからない魚は null（無理に別の魚の写真を出さない）。
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
const PUBLIC = path.join(ROOT, "public");

/** 図鑑の魚種一覧（サイトのデータから生成） */
export function loadFishIndex() {
  const out = execFileSync("npx", ["--yes", "tsx@4.23.15", path.join(ROOT, "scripts/sns/weekly-carousel/fish-index.ts")],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 20 * 1024 * 1024 });
  return JSON.parse(out);
}

// 図鑑画像のうちイラスト・図版のもの（実写ではないので使わない。2026-11 に目視で確認）
const ILLUSTRATIONS = new Set(["saba.jpg", "kisu.jpg", "kamasu.jpg", "koshoudai.jpg", "oniokoze.jpg"]);

/** LICENSES.md → { "kurodai.jpg": { source, license, author } }（イラスト・SVG由来は除外） */
function loadLicenses() {
  const md = fs.readFileSync(path.join(PUBLIC, "images/fish/LICENSES.md"), "utf8");
  const map = {};
  for (const line of md.split("\n")) {
    const c = line.split("|").map((x) => x.trim());
    if (c.length < 7 || !/\.jpe?g$/i.test(c[1])) continue;
    if (ILLUSTRATIONS.has(c[1]) || /\.svg$|Plate|Fishes_of/i.test(c[3])) continue;
    map[c[1]] = { source: c[3], license: c[4], author: c[5] };
  }
  return map;
}
const creditOf = (name, lic) => {
  const author = /^(-|Wikimedia Commons contributor)?$/.test(lic.author) ? "" : `${lic.author} / `;
  return `${name}: ${author}Wikimedia Commons (${lic.license})`;
};

const norm = (s) => s.replace(/[\s　]/g, "").toLowerCase();
const PREFIX = /^(豆|小|中|大|良型|特大|新子|子|ジャンボ|デカ|尺)/;

/**
 * @param fishIndex loadFishIndex() の結果
 * @param fetchOwner (s3Key) => ローカルパス（非公開S3から取得）
 * @param seed 週ごとに写真を回すための数（同じ魚に複数写真がある場合）
 */
export function createPhotoResolver(fishIndex, fetchOwner, seed = 0) {
  const owner = JSON.parse(fs.readFileSync(new URL("./owner-photos.json", import.meta.url), "utf8"));
  const licenses = loadLicenses();
  const byName = new Map();
  for (const f of fishIndex) {
    for (const n of [f.name, f.kana, ...f.aliases]) {
      const k = norm(n);
      if (!byName.has(k)) byName.set(k, []);
      byName.get(k).push(f);
    }
  }
  const names = [...byName.keys()].sort((a, b) => b.length - a.length);

  /** 1語 → 候補の魚種（完全一致 → 接頭辞除去 → 末尾一致の最長） */
  const lookup = (token) => {
    const t = norm(token);
    if (!t) return [];
    if (byName.has(t)) return byName.get(t);
    const s = t.replace(PREFIX, "");
    if (s !== t && byName.has(s)) return byName.get(s);
    const hit = names.find((n) => n.length >= 2 && t.endsWith(n));
    return hit ? byName.get(hit) : [];
  };

  /** 魚種 → 写真 { file, credit }（credit が null なら自前の写真） */
  const photoOf = async (f) => {
    const own = owner[f.slug];
    if (own?.length) {
      try { return { file: await fetchOwner(own[seed % own.length]), credit: null }; } catch (e) { console.warn("オーナー写真の取得失敗:", e.message); }
    }
    const up = f.userPhotos.map((u) => path.join(PUBLIC, u)).filter((p) => fs.existsSync(p));
    if (up.length) return { file: up[seed % up.length], credit: null };
    if (f.imageUrl) {
      const lic = licenses[path.basename(f.imageUrl)];
      const p = path.join(PUBLIC, f.imageUrl);
      if (lic && fs.existsSync(p)) return { file: p, credit: creditOf(f.name, lic) };
    }
    return null;
  };

  const cache = new Map();
  /** 週報の魚欄（例: "サバ・アジ・メバル・カサゴ"）→ 先頭から順に写真のある魚 { slug, name, file, credit } | null */
  return async (fishText) => {
    const base = fishText.replace(/[（(][^）)]*[）)]/g, "");
    for (const token of base.split(/[・／/、,，\s]+/)) {
      for (const f of lookup(token)) {
        if (!cache.has(f.slug)) cache.set(f.slug, await photoOf(f));
        const p = cache.get(f.slug);
        if (p) return { slug: f.slug, name: f.name, ...p };
      }
    }
    return null;
  };
}
