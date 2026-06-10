#!/usr/bin/env node
/**
 * 欠損画像（死に参照）の一括削除スクリプト
 *
 * src/lib/data/missing-spot-images.json に列挙された「実体が public/ に無い」
 * ローカル画像パスについて、spots*.ts の mainImageUrl / images[] から参照を除去する。
 *
 * - mainImageUrl: "<dead>"            → mainImageUrl: ""（隣接 imageAttribution も除去）
 * - images: [..., "<dead>", ...]      → 配列から該当要素のみ除去（空なら images: []）
 * - mainImageUrl: "" + images: [] の直後に残った imageAttribution も除去
 *
 * 除去後のスポットは spot-image-resolver.ts のデフォルト動作
 * （resolveSpotImageSrc → undefined / isDisplayableSpotImage → false）により
 * グラデーションプレースホルダー表示になるだけで、表示は壊れない。
 *
 * 使い方:
 *   node scripts/remove-dead-image-refs.mjs          # ドライラン（件数のみ）
 *   node scripts/remove-dead-image-refs.mjs --apply  # 実書き換え
 *
 * 実行後は `node scripts/validate-spot-images.mjs` を再実行して
 * missing-spot-images.json を更新すること。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "src/lib/data");
const MISSING_JSON = path.join(DATA_DIR, "missing-spot-images.json");
const APPLY = process.argv.includes("--apply");

const deadPaths = JSON.parse(fs.readFileSync(MISSING_JSON, "utf8"));
const spotFiles = fs
  .readdirSync(DATA_DIR)
  .filter((f) => /^spots.*\.ts$/.test(f));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let totalMain = 0; // mainImageUrl の置換数（≒ 影響スポット数）
let totalArr = 0; // images[] からの要素除去数
let totalAttr = 0; // imageAttribution の除去数
let touchedFiles = 0;
const perFile = [];

for (const file of spotFiles) {
  const p = path.join(DATA_DIR, file);
  let src = fs.readFileSync(p, "utf8");
  const before = src;
  let fileMain = 0;
  let fileArr = 0;
  let fileAttr = 0;

  for (const dead of deadPaths) {
    if (!src.includes(`"${dead}"`)) continue;
    const d = esc(dead);

    // 1) mainImageUrl: "<dead>" (+直後の imageAttribution) → mainImageUrl: ""
    src = src.replace(
      new RegExp(
        `mainImageUrl:\\s*"${d}"(\\s*,\\s*imageAttribution:\\s*"[^"]*")?`,
        "g"
      ),
      () => {
        fileMain++;
        return 'mainImageUrl: ""';
      }
    );

    // 2) images 配列から該当要素を除去（mainImageUrl 置換後の残りはすべて配列内）
    //    a. 後続要素がある場合: "<dead>", → 削除
    src = src.replace(new RegExp(`"${d}"\\s*,\\s*`, "g"), () => {
      fileArr++;
      return "";
    });
    //    b. 末尾要素の場合: , "<dead>" → 削除
    src = src.replace(new RegExp(`,\\s*"${d}"`, "g"), () => {
      fileArr++;
      return "";
    });
    //    c. 唯一の要素の場合: ["<dead>"] → []
    src = src.replace(new RegExp(`"${d}"`, "g"), () => {
      fileArr++;
      return "";
    });
  }

  // 3) 画像を完全に失ったスポットの孤立 imageAttribution を除去
  //    （mainImageUrl: "" と images: [] が揃ったクラスタ内のみ。順序2パターン対応。
  //      既存の空文字 imageAttribution: "" は無関係なので触らない）
  src = src.replace(
    /mainImageUrl: "",(\s*)images: \[\],\s*imageAttribution:\s*"[^"]+",/g,
    (_, ws) => {
      fileAttr++;
      return `mainImageUrl: "",${ws}images: [],`;
    }
  );
  src = src.replace(
    /mainImageUrl: "",(\s*)imageAttribution:\s*"[^"]+",(\s*)images: \[\],/g,
    (_, ws1, ws2) => {
      fileAttr++;
      return `mainImageUrl: "",${ws2 || ws1}images: [],`;
    }
  );

  if (src !== before) {
    touchedFiles++;
    perFile.push({ file, main: fileMain, arr: fileArr, attr: fileAttr });
    totalMain += fileMain;
    totalArr += fileArr;
    totalAttr += fileAttr;
    if (APPLY) fs.writeFileSync(p, src);
  }
}

console.log(`=== 死に参照削除 ${APPLY ? "(実書き換え)" : "(ドライラン)"} ===`);
console.log(`欠損パス: ${deadPaths.length}`);
console.log(`mainImageUrl 置換（≒スポット数）: ${totalMain}`);
console.log(`images[] 要素除去: ${totalArr}`);
console.log(`imageAttribution 除去: ${totalAttr}`);
console.log(`変更ファイル数: ${touchedFiles}`);
for (const f of perFile) {
  console.log(`  ${f.file}: main=${f.main} images=${f.arr} attr=${f.attr}`);
}
if (!APPLY) console.log("\n--apply を付けると実際に書き換えます");
