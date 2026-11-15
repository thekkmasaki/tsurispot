#!/usr/bin/env node
// コンテンツの「実際の最終更新日」を git 履歴から生成する（sitemap lastmod / JSON-LD dateModified 用）。
//
// 背景: 旧実装は sitemap の lastmod や dateModified に new Date()（= ビルド日）を入れており、
// デプロイのたびに全ページが「今日更新」扱いになっていた。Google は lastmod が実態と
// 合わないサイトの lastmod を信用しなくなるため、データファイルの最終コミット日を使う。
//
// 出力: src/lib/data/generated/content-dates.json
//   files: { "src/app/guide/page.tsx": "YYYY-MM-DD", "src/lib/data/fish-sea.ts": ... }
//   spots: { "<spot slug>": "YYYY-MM-DD" }   … そのスポットを定義している spots*.ts の最終更新日
//   fish:  { "<fish slug>": "YYYY-MM-DD" }   … その魚種を定義している fish*.ts の最終更新日
//
// 実行タイミング: `npm run build` の prebuild で自動実行。
// git が無い / shallow clone（履歴が1コミットしかなく全ファイルが同日になる）の場合は
// 何もせず、コミット済みの JSON をそのまま使う（Docker ビルド等のフォールバック）。
// 手動更新: `node scripts/gen-content-dates.mjs [--git-dir <完全履歴のあるclone>]`
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "src/lib/data/generated/content-dates.json");
const TRACKED_DIRS = ["src/app", "src/lib/data"];

const gitDirArg = process.argv.indexOf("--git-dir");
const GIT_CWD = gitDirArg > -1 ? path.resolve(process.argv[gitDirArg + 1]) : ROOT;

function git(args) {
  return execFileSync("git", args, { cwd: GIT_CWD, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

function skip(reason) {
  console.log(`[gen-content-dates] skip (${reason}) — コミット済みの content-dates.json を使用`);
  process.exit(0);
}

try {
  git(["rev-parse", "--git-dir"]);
} catch {
  skip("git リポジトリではない");
}
try {
  if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") skip("shallow clone");
} catch {
  skip("git rev-parse 失敗");
}

// 1回の git log で「各ファイルが最後に変更されたコミット日」を取る（先に出た日付 = 最新）
const log = git(["log", "--format=>%cI", "--name-only", "HEAD", "--", ...TRACKED_DIRS]);
const files = {};
let current = null;
for (const line of log.split("\n")) {
  if (line.startsWith(">")) {
    current = line.slice(1, 11); // YYYY-MM-DD（コミッタ日付のローカル日付部分）
  } else if (line && current && !(line in files)) {
    files[line] = current;
  }
}

// 現存するファイルだけ残す（削除・リネーム済みの旧パスを落とす）
for (const f of Object.keys(files)) {
  if (!existsSync(path.join(ROOT, f))) delete files[f];
}

// データファイル内の slug 定義 → そのファイルの更新日
function slugDates(filter) {
  const out = {};
  const dir = path.join(ROOT, "src/lib/data");
  for (const name of readdirSync(dir)) {
    if (!filter(name)) continue;
    const rel = `src/lib/data/${name}`;
    const date = files[rel];
    if (!date) continue;
    const src = readFileSync(path.join(dir, name), "utf8");
    for (const line of src.split("\n")) {
      // Region 定義（{ id, prefecture, areaName, slug }）の slug は除外
      if (line.includes("prefecture:") || line.includes("areaName:")) continue;
      for (const m of line.matchAll(/\bslug:\s*["']([a-z0-9-]+)["']/g)) {
        const slug = m[1];
        if (!out[slug] || out[slug] < date) out[slug] = date;
      }
    }
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

const spots = slugDates((n) => /^spots.*\.ts$/.test(n));
const fish = slugDates((n) => /^fish-(sea|freshwater|brackish)(-[a-z-]+)?\.ts$/.test(n));

const sortedFiles = Object.fromEntries(
  Object.entries(files)
    .filter(([f]) => /\.(ts|tsx|json)$/.test(f) && !f.includes("__tests__") && !f.includes("/generated/"))
    .sort(([a], [b]) => a.localeCompare(b)),
);
const latest = Object.values(sortedFiles).sort().at(-1) ?? null;

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ latest, files: sortedFiles, spots, fish }, null, 0).replace(/,"/g, ',\n"') + "\n",
);
console.log(
  `[gen-content-dates] files=${Object.keys(sortedFiles).length} spots=${Object.keys(spots).length} fish=${Object.keys(fish).length} latest=${latest}`,
);
