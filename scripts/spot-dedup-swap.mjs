#!/usr/bin/env node
/**
 * 統合の勝者入れ替え（GSC クリック検証の結果を反映、2026-11）
 *
 * 入力: "敗者:クリック>勝者:クリック" をスペース/改行区切りで並べたファイル（GSC 直近3か月）
 * 処理: spot-merge-map.ts で「勝者を指す全エントリ」を新勝者（=旧敗者）へ付け替え、
 *       新勝者のキーを削除し、旧勝者→新勝者 のエントリを追加する（1ホップ維持）。
 *       striking-spots 登録 slug / UGC のある slug が旧勝者の場合は入れ替えない。
 *       旧勝者に第2弾で座標修正を入れていた場合は、同じ座標を新勝者のデータへ移す。
 *
 * 使い方: node scripts/spot-dedup-swap.mjs scripts/output/gsc-swap-candidates.txt
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAP = path.join(ROOT, "src/lib/data/spot-merge-map.ts");
const DATA = path.join(ROOT, "src/lib/data");
const KEEP = new Set(["morozaki-port", "okitsu-kou-chiba", "watanoha-gyokou6"]); // UGC あり（DynamoDB 確認）
for (const m of fs.readFileSync(path.join(DATA, "striking-spots.ts"), "utf8").matchAll(/"([a-z0-9-]+)"/g)) KEEP.add(m[1]);

const items = fs
  .readFileSync(path.resolve(ROOT, process.argv[2]), "utf8")
  .split(/\s+/)
  .filter(Boolean)
  .map((t) => {
    const m = t.match(/^([^:]+):(\d+)>([^:]+):(\d+)$/);
    return { loser: m[1], lc: +m[2], winner: m[3], wc: +m[4] };
  });

// 同じ勝者に複数候補がある場合はクリック最大の敗者を新勝者にする
const best = new Map();
for (const it of items) if (!best.has(it.winner) || best.get(it.winner).lc < it.lc) best.set(it.winner, it);

let src = fs.readFileSync(MAP, "utf8");
const coordFixes = [];
for (const f of fs.readdirSync(path.join(ROOT, "scripts/output")).filter((f) => /^dedup-wave2-apply-\d+-\d+\.json$/.test(f))) {
  for (const c of JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/output", f), "utf8")).coordDone) coordFixes.push(c);
}

const done = [];
const kept = [];
for (const { loser: nw, winner: old, lc, wc } of best.values()) {
  if (KEEP.has(old)) {
    kept.push(`${old}（${wc}）← ${nw}（${lc}）: 旧勝者が striking-spots/UGC のため維持`);
    continue;
  }
  const line = src.match(new RegExp(`^ {2}"${nw}": "${old}",[^\\n]*$`, "m"));
  if (!line) throw new Error(`統合表に ${nw} -> ${old} が無い`);
  // 新勝者のキーを削除
  src = src.replace(line[0] + "\n", "");
  // 旧勝者を指す他のエントリを新勝者へ
  src = src.replace(new RegExp(`(^ {2}"[^"]+": )"${old}"`, "gm"), `$1"${nw}"`);
  // 旧勝者→新勝者 を同じ位置付近（末尾セクション）に追加
  src = src.replace(
    /\n};\s*$/,
    `\n  "${old}": "${nw}", // GSC直近3か月クリック ${wc} < 統合元 ${lc} のため勝者を入れ替え（2026-11）\n};\n`,
  );
  // 旧勝者の座標修正を新勝者へ移す
  const cf = coordFixes.find((c) => c.startsWith(`${old}:`));
  if (cf) {
    const [, lat, lng] = cf.match(/→ (-?[\d.]+),(-?[\d.]+)/);
    const files = fs.readdirSync(DATA).filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));
    let moved = false;
    for (const f of files) {
      const p = path.join(DATA, f);
      const s = fs.readFileSync(p, "utf8");
      const i = s.indexOf(`slug: "${nw}"`);
      if (i < 0) continue;
      const next = s.indexOf("slug:", i + 5);
      const end = next < 0 ? s.length : next;
      const block = s.slice(i, end).replace(/latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/, `latitude: ${lat}, longitude: ${lng}`);
      fs.writeFileSync(p, s.slice(0, i) + block + s.slice(end));
      moved = true;
      break;
    }
    done.push(`${nw}（${lc}）← ${old}（${wc}）${moved ? "・座標修正も移行" : "・座標移行失敗"}`);
  } else {
    done.push(`${nw}（${lc}）← ${old}（${wc}）`);
  }
}
fs.writeFileSync(MAP, src);
fs.writeFileSync(path.join(ROOT, "scripts/output/gsc-swap-result.json"), JSON.stringify({ done, kept }, null, 2));
console.log(`swapped=${done.length} kept=${kept.length}`);
for (const k of kept) console.log("KEEP", k);
