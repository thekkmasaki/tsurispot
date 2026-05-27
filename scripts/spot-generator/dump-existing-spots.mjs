#!/usr/bin/env node
/**
 * dump-existing-spots.mjs
 *
 * src/lib/data/spots-*.ts を正規表現で走査し、登録済みスポットの
 * {slug, name, lat, lng} を JSON として出力する。
 *
 * validate-new-spots.js が読む形式と互換になるよう、
 * /tmp/existing-slugs.json /tmp/existing-names.json /tmp/existing-coords.json も同時に出す。
 *
 * Usage:
 *   node scripts/spot-generator/dump-existing-spots.mjs --out=/tmp/spotgen/{run-id}/existing.json
 *
 * 既存ファイルは spots-*.ts という命名規則。spots.ts (アグリゲータ) は除外する。
 * registry.ts でコメントアウトされたファイルも、ファイル単位では物理存在するので
 * 「物理的に存在するすべての spots-*.ts」を対象にする。
 *
 * 注意: TSXコンパイラを使わず正規表現で抽出するため、フォーマットが極端に
 * 崩れている場合は取りこぼす可能性がある。 spots-add12-*.ts レベルの綺麗な
 * 整形を前提とする。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(REPO_ROOT, "src", "lib", "data");

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

function extractSpotsFromFile(content) {
  // 1スポット = `{ id: "...", name: "...", slug: "...", ..., latitude: N, longitude: N, ... }`
  // 単純化: slug 出現位置を起点に、name / latitude / longitude を前後 ±1500 字から探す
  const spots = [];
  const slugRe = /slug:\s*["']([a-z0-9-]+)["']/g;
  let m;
  while ((m = slugRe.exec(content)) !== null) {
    const slug = m[1];
    const start = Math.max(0, m.index - 1500);
    const end = Math.min(content.length, m.index + 1500);
    const window = content.slice(start, end);

    const nameM = window.match(/name:\s*["']([^"']+)["']/);
    const latM = window.match(/latitude:\s*(-?[\d.]+)/);
    const lngM = window.match(/longitude:\s*(-?[\d.]+)/);

    if (!nameM || !latM || !lngM) continue;
    spots.push({
      slug,
      name: nameM[1],
      lat: parseFloat(latM[1]),
      lng: parseFloat(lngM[1]),
    });
  }
  return spots;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outPath = args.out;
  if (!outPath) {
    console.error("missing --out=<path>");
    process.exit(1);
  }

  const all = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("spots-") && f.endsWith(".ts"))
    // アグリゲータと registry は除外
    .filter((f) => f !== "spots-registry.ts");

  const collected = [];
  const seenSlugs = new Set();
  for (const f of all) {
    const content = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
    const spots = extractSpotsFromFile(content);
    for (const s of spots) {
      if (seenSlugs.has(s.slug)) continue; // 同 slug の二重カウント回避
      seenSlugs.add(s.slug);
      collected.push({ ...s, source_file: f });
    }
  }

  // メイン JSON 出力
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(collected, null, 2) + "\n", "utf8");

  // validate-new-spots.js が読む3ファイルにも書き出す（互換用）
  const tmpSlugs = "/tmp/existing-slugs.json";
  const tmpNames = "/tmp/existing-names.json";
  const tmpCoords = "/tmp/existing-coords.json";
  fs.writeFileSync(tmpSlugs, JSON.stringify(collected.map((s) => s.slug)) + "\n");
  fs.writeFileSync(tmpNames, JSON.stringify(collected.map((s) => s.name)) + "\n");
  fs.writeFileSync(
    tmpCoords,
    JSON.stringify(collected.map((s) => ({ slug: s.slug, lat: s.lat, lng: s.lng }))) +
      "\n",
  );

  console.log(
    JSON.stringify({
      ok: true,
      total: collected.length,
      files_scanned: all.length,
      out: outPath,
    }),
  );
}

main();
