#!/usr/bin/env node
/**
 * capacity-check.mjs
 *
 * Docker イメージサイズ上限(2.65GB) 由来の制約から、
 * 「これ以上スポットを増やすとデプロイが落ちる」リスクを軽量に近似チェックする。
 *
 * 2系統併用:
 *   - L1: 総スポット数（dump-existing-spots.mjs の結果を再利用、または現場 count を取り直す）
 *   - L2: src/lib/data/spots-*.ts の合計バイト数
 *
 * 出力: JSON
 *   { total_spots, ts_bytes, level: "ok"|"warn"|"hard", reason: "...", thresholds: {...} }
 *
 * exit code:
 *   0 = ok
 *   1 = warn (どちらかが WARN ライン超え)
 *   2 = hard (どちらかが HARD ライン超え。 skill 側で STEP 8 を停止する)
 *
 * Usage:
 *   node scripts/spot-generator/capacity-check.mjs
 *   node scripts/spot-generator/capacity-check.mjs --existing=/tmp/spotgen/{run-id}/existing.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(REPO_ROOT, "src", "lib", "data");

// しきい値（プラン書に基づく初期値。実測で調整可）
const HARD_COUNT = 8500;
const WARN_COUNT = 8200;
const HARD_BYTES = 18 * 1024 * 1024; // 18MB
const WARN_BYTES = 16 * 1024 * 1024; // 16MB

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

function countSpotsFromExistingFile(file) {
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  return arr.length;
}

function countSpotsByScan() {
  // dump-existing-spots と同じ正規表現で粗くカウント。
  // 厳密値ではないが、HARD/WARN の判定には十分。
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("spots-") && f.endsWith(".ts"))
    .filter((f) => f !== "spots-registry.ts");
  let count = 0;
  for (const f of files) {
    const content = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
    const matches = content.match(/slug:\s*["'][a-z0-9-]+["']/g);
    if (matches) count += matches.length;
  }
  return count;
}

function sumTsBytes() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));
  let bytes = 0;
  for (const f of files) {
    bytes += fs.statSync(path.join(DATA_DIR, f)).size;
  }
  return bytes;
}

function classify(totalSpots, tsBytes) {
  if (totalSpots >= HARD_COUNT || tsBytes >= HARD_BYTES) {
    const reasons = [];
    if (totalSpots >= HARD_COUNT) reasons.push(`total_spots=${totalSpots} >= ${HARD_COUNT}`);
    if (tsBytes >= HARD_BYTES) reasons.push(`ts_bytes=${tsBytes} >= ${HARD_BYTES}`);
    return { level: "hard", reason: reasons.join(" / ") };
  }
  if (totalSpots >= WARN_COUNT || tsBytes >= WARN_BYTES) {
    const reasons = [];
    if (totalSpots >= WARN_COUNT) reasons.push(`total_spots=${totalSpots} >= ${WARN_COUNT}`);
    if (tsBytes >= WARN_BYTES) reasons.push(`ts_bytes=${tsBytes} >= ${WARN_BYTES}`);
    return { level: "warn", reason: reasons.join(" / ") };
  }
  return { level: "ok", reason: "" };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const totalSpots = args.existing
    ? countSpotsFromExistingFile(args.existing)
    : countSpotsByScan();
  const tsBytes = sumTsBytes();
  const { level, reason } = classify(totalSpots, tsBytes);
  const report = {
    total_spots: totalSpots,
    ts_bytes: tsBytes,
    level,
    reason,
    thresholds: { HARD_COUNT, WARN_COUNT, HARD_BYTES, WARN_BYTES },
    remaining_to_hard: {
      by_count: HARD_COUNT - totalSpots,
      by_bytes: HARD_BYTES - tsBytes,
    },
  };
  console.log(JSON.stringify(report, null, 2));
  if (level === "hard") process.exit(2);
  if (level === "warn") process.exit(1);
}

main();
